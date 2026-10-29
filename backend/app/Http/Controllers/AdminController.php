<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Category;
use App\Models\Settlement;
use App\Models\Service;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Statistikat e përgjithshme për Pamjen Fillestare të Panelit.
     */
    public function stats()
    {
        $totalBusinesses = Business::count();
        $publishedCount = Business::where('status', 'published')->count();
        $draftCount = Business::where('status', 'draft')->count();
        $archivedCount = Business::where('status', 'archived')->count();
        
        $now = Carbon::now();
        $activeAdsCount = Advertisement::where('status', 'active')
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->count();

        $categoryCount = Category::count();
        $settlementCount = Settlement::count();

        return response()->json([
            'total_businesses' => $totalBusinesses,
            'published_count' => $publishedCount,
            'draft_count' => $draftCount,
            'archived_count' => $archivedCount,
            'active_ads_count' => $activeAdsCount,
            'category_count' => $categoryCount,
            'settlement_count' => $settlementCount,
        ]);
    }

    /**
     * Lista e të gjitha bizneseve me mundësi filtrimi sipas statusit, kategorisë dhe kërkimit.
     */
    public function businesses(Request $request)
    {
        $query = Business::with(['category', 'settlement']);

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->query('category'));
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($b) use ($q) {
                $b->where('name', 'LIKE', "%{$q}%")
                  ->orWhere('address', 'LIKE', "%{$q}%")
                  ->orWhere('phone', 'LIKE', "%{$q}%");
            });
        }

        $businesses = $query->orderBy('created_at', 'desc')->get();
        return response()->json($businesses);
    }

    /**
     * Krijimi i një biznesi të ri.
     */
    public function createBusiness(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'required|string|exists:categories,id',
            'settlement_id' => 'required|string|exists:settlements,id',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|url|max:255',
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'featured' => 'boolean',
            'opening_hours' => 'nullable|array',
            'services' => 'nullable|array',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'cover_image' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        if ($validated['status'] === 'published'
            && (($validated['latitude'] ?? null) === null || ($validated['longitude'] ?? null) === null)) {
            return response()->json([
                'message' => 'Për publikim duhet të caktohen koordinatat reale të biznesit.',
                'errors' => ['latitude' => ['Koordinatat kërkohen për publikim.'], 'longitude' => ['Koordinatat kërkohen për publikim.']],
            ], 422);
        }

        $id = 'b-' . time();
        $slug = Str::slug($validated['name']) . '-' . rand(100, 999);

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
            'rating' => 0,
            'review_count' => 0,
            'featured' => $validated['featured'] ?? false,
            'status' => $validated['status'],
            'opening_hours' => $validated['opening_hours'] ?? null,
            'services' => $validated['services'] ?? [],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'logo' => $validated['logo'] ?? null,
            'is_demo' => false,
        ]);

        return response()->json([
            'message' => 'Biznesi u krijua me sukses.',
            'business' => $business->load(['category', 'settlement']),
        ], 201);
    }

    /**
     * Përditësimi i të dhënave të biznesit.
     */
    public function updateBusiness(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'category_id' => 'sometimes|required|string|exists:categories,id',
            'settlement_id' => 'sometimes|required|string|exists:settlements,id',
            'address' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:50',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|string|max:255',
            'short_description' => 'sometimes|required|string|max:500',
            'description' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:draft,published,archived',
            'featured' => 'boolean',
            'opening_hours' => 'nullable|array',
            'services' => 'nullable|array',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'cover_image' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        $oldStatus = $business->status;
        if (($validated['status'] ?? null) === 'published'
            || (in_array($business->status, ['published'], true)
                && (array_key_exists('latitude', $validated) || array_key_exists('longitude', $validated)))) {
            $latitude = array_key_exists('latitude', $validated) ? $validated['latitude'] : $business->latitude;
            $longitude = array_key_exists('longitude', $validated) ? $validated['longitude'] : $business->longitude;
            if ($latitude === null || $longitude === null || $latitude === '' || $longitude === '') {
                return response()->json([
                    'message' => 'Për publikim duhet të caktohen koordinatat reale të biznesit.',
                    'errors' => ['latitude' => ['Koordinatat kërkohen për publikim.'], 'longitude' => ['Koordinatat kërkohen për publikim.']],
                ], 422);
            }
        }
        $business->update($validated);

        // Kërkesa strikte e PDF (faqe 8 & T-11):
        // Kur një biznes arkivohet, reklamat e tij të lidhura ndalen (disabled).
        if (isset($validated['status']) && $validated['status'] === 'archived' && $oldStatus !== 'archived') {
            Advertisement::where('business_id', $business->id)->update(['status' => 'disabled']);
        }

        return response()->json([
            'message' => 'Biznesi u përditësua me sukses.',
            'business' => $business->fresh(['category', 'settlement']),
        ]);
    }

    /**
     * Fshirja e biznesit.
     */
    public function deleteBusiness($id)
    {
        $business = Business::findOrFail($id);
        $businessName = $business->name;
        $business->delete();

        return response()->json([
            'message' => "Biznesi \"{$businessName}\" u fshi me sukses.",
        ]);
    }

    /**
     * KATEGORITË - CRUD
     */
    public function categories()
    {
        return response()->json(Category::withCount('businesses')->get());
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);

        $slug = Str::slug($validated['name']);
        $id = $slug;

        $category = Category::create([
            'id' => $id,
            'slug' => $slug,
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? 'Layers',
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? '#0d9488',
        ]);

        return response()->json([
            'message' => 'Kategoria u shtua me sukses.',
            'category' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Kategoria u përditësua me sukses.',
            'category' => $category,
        ]);
    }

    public function deleteCategory($id)
    {
        $category = Category::withCount('businesses')->findOrFail($id);

        // Kërkesë e PDF (fq. 8): Një kategori në përdorim nuk hiqet pa zgjidhur më parë lidhjen.
        if ($category->businesses_count > 0) {
            return response()->json([
                'message' => "Nuk mund të fshihet kategoria \"{$category->name}\" pasi ka {$category->businesses_count} biznese të lidhura. Zhvendosni bizneset më parë.",
            ], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Kategoria u fshi me sukses.']);
    }

    /**
     * VENDBANIMET - CRUD
     */
    public function settlements()
    {
        return response()->json(Settlement::withCount('businesses')->get());
    }

    public function storeSettlement(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'is_town' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $id = Str::slug($validated['name']);

        $settlement = Settlement::create([
            'id' => $id,
            'name' => $validated['name'],
            'is_town' => $validated['is_town'] ?? false,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Vendbanimi u shtua me sukses.',
            'settlement' => $settlement,
        ], 201);
    }

    public function updateSettlement(Request $request, $id)
    {
        $settlement = Settlement::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'is_town' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $settlement->update($validated);

        return response()->json([
            'message' => 'Vendbanimi u përditësua me sukses.',
            'settlement' => $settlement,
        ]);
    }

    public function deleteSettlement($id)
    {
        $settlement = Settlement::withCount('businesses')->findOrFail($id);

        if ($settlement->businesses_count > 0) {
            return response()->json([
                'message' => "Nuk mund të fshihet vendbanimi \"{$settlement->name}\" pasi ka {$settlement->businesses_count} biznese të lidhura me të.",
            ], 422);
        }

        $settlement->delete();
        return response()->json(['message' => 'Vendbanimi u fshi me sukses.']);
    }

    /**
     * SHËRBIMET - CRUD. Bizneset i ruajnë etiketat e shërbimeve si JSON,
     * prandaj ndryshimi i emrit sinkronizohet me to dhe fshirja e lidhur bllokohet.
     */
    public function services()
    {
        $services = Service::with('category')->orderBy('name')->get();
        $services->each(function (Service $service) {
            $service->businesses_count = Business::whereJsonContains('services', $service->name)->count();
        });

        return response()->json($services);
    }

    public function storeService(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('services', 'name')],
            'category_id' => ['nullable', 'string', 'exists:categories,id'],
        ]);

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Shërbimi u shtua me sukses.',
            'service' => $service->load('category'),
        ], 201);
    }

    public function updateService(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('services', 'name')->ignore($service->id)],
            'category_id' => ['sometimes', 'nullable', 'string', 'exists:categories,id'],
        ]);

        DB::transaction(function () use ($service, $validated) {
            if (isset($validated['name']) && $validated['name'] !== $service->name) {
                Business::whereJsonContains('services', $service->name)->get()->each(function (Business $business) use ($service, $validated) {
                    $services = collect($business->services ?? [])->map(
                        fn ($name) => $name === $service->name ? $validated['name'] : $name
                    )->all();
                    $business->update(['services' => $services]);
                });
            }

            $service->update($validated);
        });

        return response()->json([
            'message' => 'Shërbimi u përditësua me sukses.',
            'service' => $service->fresh('category'),
        ]);
    }

    public function deleteService($id)
    {
        $service = Service::findOrFail($id);
        $linkedBusinesses = Business::whereJsonContains('services', $service->name)->count();

        if ($linkedBusinesses > 0) {
            return response()->json([
                'message' => "Shërbimi \"{$service->name}\" përdoret nga {$linkedBusinesses} biznese dhe nuk mund të fshihet.",
            ], 422);
        }

        $service->delete();

        return response()->json(['message' => 'Shërbimi u fshi me sukses.']);
    }

    /**
     * REKLAMAT - CRUD
     */
    public function advertisements()
    {
        $ads = Advertisement::with('business')->orderBy('priority', 'desc')->get();
        return response()->json($ads);
    }

    public function storeAdvertisement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'sponsor' => 'required|string|max:150',
            'placement' => 'required|in:banner-home,banner-catalog',
            'business_id' => 'nullable|string|exists:businesses,id',
            'destination_url' => 'nullable|string|max:255',
            'image_url' => 'nullable|string',
            'alt_text' => 'nullable|string|max:150',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time', // Kërkesë e PDF (fq. 7): mbarimi pas fillimit
            'priority' => 'integer|min:0',
            'status' => 'required|in:active,scheduled,expired,disabled',
        ], [
            'end_time.after' => 'Koha e mbarimit të reklamës duhet të jetë pas kohës së fillimit.',
        ]);

        $ad = Advertisement::create($validated);

        return response()->json([
            'message' => 'Reklama u krijua me sukses.',
            'advertisement' => $ad->load('business'),
        ], 201);
    }

    public function updateAdvertisement(Request $request, $id)
    {
        $ad = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'sponsor' => 'sometimes|required|string|max:150',
            'placement' => 'sometimes|required|in:banner-home,banner-catalog',
            'business_id' => 'nullable|string|exists:businesses,id',
            'destination_url' => 'nullable|string|max:255',
            'image_url' => 'nullable|string',
            'alt_text' => 'nullable|string|max:150',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
            'priority' => 'integer|min:0',
            'status' => 'sometimes|required|in:active,scheduled,expired,disabled',
        ]);

        $ad->update($validated);

        return response()->json([
            'message' => 'Reklama u përditësua me sukses.',
            'advertisement' => $ad->fresh('business'),
        ]);
    }

    public function deleteAdvertisement($id)
    {
        $ad = Advertisement::findOrFail($id);
        $ad->delete();

        return response()->json(['message' => 'Reklama u fshi me sukses.']);
    }
}
