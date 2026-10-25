<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Category;
use App\Models\Settlement;
use App\Models\Service;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PublicController extends Controller
{
    /**
     * Lista publike e bizneseve të publikuara me kërkim, filtra, renditje dhe faqezim (12 për faqe).
     */
    public function businesses(Request $request)
    {
        $query = Business::with(['category', 'settlement'])
            ->where('status', 'published');

        // 1. Kërkimi me tekst (emër, përshkrim, shërbime)
        if ($request->filled('q')) {
            $term = trim($request->query('q'));
            // Mbështetje për zëvendësim të butë të karaktereve shqipe si ë/e
            $normalizedTerm = str_replace(['ë', 'Ë'], 'e', mb_strtolower($term));
            
            $query->where(function ($q) use ($term, $normalizedTerm) {
                $q->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('description', 'LIKE', "%{$term}%")
                  ->orWhere('short_description', 'LIKE', "%{$term}%")
                  ->orWhere('address', 'LIKE', "%{$term}%")
                  ->orWhereRaw("LOWER(REPLACE(REPLACE(name, 'ë', 'e'), 'Ë', 'e')) LIKE ?", ["%{$normalizedTerm}%"])
                  ->orWhereRaw("LOWER(REPLACE(REPLACE(description, 'ë', 'e'), 'Ë', 'e')) LIKE ?", ["%{$normalizedTerm}%"]);
            });
        }

        // 2. Filtri sipas Kategorisë
        if ($request->filled('category')) {
            $cat = $request->query('category');
            $query->where('category_id', $cat);
        }

        // 3. Filtri sipas Vendbanimit
        if ($request->filled('settlement')) {
            $settle = $request->query('settlement');
            $query->where('settlement_id', $settle);
        }

        // 4. Filtri sipas Shërbimit
        if ($request->filled('service')) {
            $srv = trim($request->query('service'));
            $query->where(function ($q) use ($srv) {
                $q->whereJsonContains('services', $srv)
                  ->orWhere('services', 'LIKE', "%{$srv}%");
            });
        }

        // 5. Filtri Statik: Vetëm me website
        if ($request->boolean('has_website')) {
            $query->whereNotNull('website')
                  ->where('website', '!=', '');
        }

        // 6. Filtri Statik: Vetëm me orar të publikuar
        if ($request->boolean('has_hours')) {
            $query->whereNotNull('opening_hours')
                  ->where('opening_hours', '!=', '[]')
                  ->where('opening_hours', '!=', 'null');
        }

        // 7. Renditja
        $sort = $request->query('sort', 'latest');
        switch ($sort) {
            case 'a-z':
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'z-a':
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'latest':
            default:
                $query->orderBy('featured', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->orderBy('id', 'desc');
                break;
        }

        // Faqezimi me 12 për faqe (sipas specifikimit të PDF)
        $perPage = 12;
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'per_page' => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'from' => $paginated->firstItem(),
            'to' => $paginated->lastItem(),
        ]);
    }

    /**
     * Profili publik i biznesit.
     * Rregull strikt: Nëse biznesi është draft ose archived, kthehet 404 dhe nuk shfaqet.
     */
    public function business($idOrSlug)
    {
        $business = Business::with(['category', 'settlement'])
            ->where(function ($q) use ($idOrSlug) {
                $q->where('id', $idOrSlug)
                  ->orWhere('slug', $idOrSlug);
            })
            ->first();

        if (!$business || $business->status !== 'published') {
            return response()->json([
                'message' => 'Biznesi nuk u gjet ose nuk është publikuar.',
            ], 404);
        }

        // Biznese të ngjashme në të njëjtën kategori
        $related = Business::where('category_id', $business->category_id)
            ->where('id', '!=', $business->id)
            ->where('status', 'published')
            ->limit(3)
            ->get();

        return response()->json([
            'business' => $business,
            'related' => $related,
        ]);
    }

    /**
     * Lista e kategorive me numrin e bizneseve të publikuara.
     */
    public function categories()
    {
        $categories = Category::withCount(['businesses' => function ($q) {
            $q->where('status', 'published');
        }])->get();

        return response()->json($categories);
    }

    /**
     * Lista e vendbanimeve me numrin e bizneseve të publikuara.
     */
    public function settlements()
    {
        $settlements = Settlement::withCount(['businesses' => function ($q) {
            $q->where('status', 'published');
        }])->get();

        return response()->json($settlements);
    }

    /**
     * Lista e shërbimeve unike të disponueshme.
     */
    public function services()
    {
        $services = Service::all();
        return response()->json($services);
    }

    /**
     * Hapësirat e reklamave aktive.
     * Rregullat:
     * - status = 'active'
     * - koha midis start_time dhe end_time
     * - biznesi i lidhur të jetë 'published' (nuk shfaqen reklama të bizneseve të arkivuara/draft)
     * - renditje sipas prioritetit më të lartë
     */
    public function advertisements(Request $request)
    {
        $now = Carbon::now();
        $placement = $request->query('placement');

        $query = Advertisement::with(['business'])
            ->where('status', 'active')
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->whereHas('business', function ($q) {
                $q->where('status', 'published');
            });

        if ($placement) {
            $query->where('placement', $placement);
        }

        $ads = $query->orderBy('priority', 'desc')
                     ->orderBy('id', 'asc')
                     ->get();

        return response()->json($ads);
    }

    /**
     * Dërgimi publik i kërkesës së biznesit nga pronari.
     * Ruhet si draft ose published sipas preferencës së platformës.
     */
    public function submitBusiness(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'required|string|exists:categories,id',
            'settlement_id' => 'required|string|exists:settlements,id',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|string|max:255',
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'opening_hours' => 'nullable|array',
            'services' => 'nullable|array',
            'cover_image' => 'nullable|string',
        ]);

        $id = 'b-' . time();
        $slug = \Illuminate\Support\Str::slug($validated['name']) . '-' . rand(100, 999);

        $business = Business::create([
            'id' => $id,
            'name' => $validated['name'],
            'slug' => $slug,
            'category_id' => $validated['category_id'],
            'settlement_id' => $validated['settlement_id'],
            'address' => $validated['address'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'website' => $validated['website'] ?? null,
            'short_description' => $validated['short_description'],
            'description' => $validated['description'],
            'rating' => 5.0,
            'review_count' => 1,
            'featured' => false,
            'status' => 'draft', // Dërgohet si draft për miratim nga administratori (PDF faqe 4 & 8)
            'opening_hours' => $validated['opening_hours'] ?? null,
            'services' => $validated['services'] ?? ['Shërbime cilësore'],
            'latitude' => 42.5217,
            'longitude' => 21.1258,
            'cover_image' => $validated['cover_image'] ?? null,
            'is_demo' => false,
        ]);

        return response()->json([
            'message' => 'Biznesi u dërgua me sukses dhe është në shqyrtim (Draft).',
            'business' => $business,
        ], 201);
    }
}
