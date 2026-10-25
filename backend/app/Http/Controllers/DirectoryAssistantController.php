<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Category;
use App\Models\Settlement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** A local, database-grounded assistant with no external AI provider or API key. */
class DirectoryAssistantController extends Controller
{
    private const MAX_HISTORY = 16;
    private const MAX_MESSAGE_LENGTH = 4000;
    private const MAX_BUSINESS_RESULTS = 8;

    public function chat(Request $request)
    {
        $validated = $request->validate([
            'language' => ['required', Rule::in(['sq', 'en'])],
            'messages' => ['required', 'array', 'min:1', 'max:' . self::MAX_HISTORY],
            'messages.*' => ['required', 'array:role,content,thought_signature'],
            'messages.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'messages.*.content' => ['required', 'string', 'min:1', 'max:' . self::MAX_MESSAGE_LENGTH],
            'messages.*.thought_signature' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ]);

        $lastUserMessage = collect($validated['messages'])->last(fn (array $message) => $message['role'] === 'user');
        if (!$lastUserMessage || trim($lastUserMessage['content']) === '') {
            return response()->json(['message' => $validated['language'] === 'en'
                ? 'Send a question about businesses, categories, or places in Lipjan.'
                : 'Shkruani një pyetje për bizneset, kategoritë ose vendbanimet në Lipjan.'], 422);
        }

        $query = trim($lastUserMessage['content']);
        $language = $validated['language'];
        $normalized = Str::lower(Str::ascii($query));

        if (preg_match('/\b(hello|hi|hey|pershendetje|tung|miredita|mirdita)\b/u', $normalized)) {
            return response()->json($this->response(
                $language === 'en'
                    ? 'Hello! I can search published businesses, categories, and settlements in the Lipjan directory.'
                    : 'Përshëndetje! Mund të kërkoj biznese të publikuara, kategori dhe vendbanime në katalogun e Lipjanit.'
            ));
        }

        $categoryIds = $this->matchingCategoryIds($query);
        $settlementIds = $this->matchingSettlementIds($query);
        $asksCategories = preg_match('/\b(category|categories|kategori|kategorite|sektor|sektoret)\w*\b/u', $normalized) === 1;
        $asksSettlements = preg_match('/\b(settlement|settlements|village|villages|town|vendban|vedban|fshat|lokalitet)\w*\b/u', $normalized) === 1;

        if ($asksCategories && !$asksSettlements) {
            $categories = $this->searchCategories($query);
            $count = count($categories);
            return response()->json($this->response(
                $language === 'en'
                    ? ($count ? "Found {$count} matching categories in the real directory:" : 'No matching categories were found in the directory.')
                    : ($count ? "U gjetën {$count} kategori përkatëse në katalogun real:" : 'Nuk u gjet asnjë kategori për këtë kërkim në katalog.'),
                categories: $categories
            ));
        }

        if ($asksSettlements) {
            $settlements = $this->searchSettlements($query);
            $count = count($settlements);
            return response()->json($this->response(
                $language === 'en'
                    ? ($count ? "Found {$count} matching settlements in the real directory:" : 'No matching settlements were found in the directory.')
                    : ($count ? "U gjetën {$count} vendbanime përkatëse në katalogun real:" : 'Nuk u gjet asnjë vendbanim për këtë kërkim në katalog.'),
                settlements: $settlements
            ));
        }

        $businesses = $this->searchBusinesses($query, $categoryIds, $settlementIds);
        $categories = $categoryIds ? $this->searchCategoriesByIds($categoryIds) : [];
        $settlements = $settlementIds ? $this->searchSettlementsByIds($settlementIds) : [];
        $count = count($businesses);

        return response()->json($this->response(
            $language === 'en'
                ? ($count ? "Found {$count} published businesses matching your request:" : 'No published businesses matched that request. Try a business name, category, or settlement in Lipjan.')
                : ($count ? "U gjetën {$count} biznese të publikuara për kërkesën tuaj:" : 'Nuk u gjet asnjë biznes i publikuar për këtë kërkim. Provoni emrin e biznesit, kategorinë ose vendbanimin në Lipjan.'),
            businesses: $businesses,
            categories: $categories,
            settlements: $settlements
        ));
    }

    private function response(string $message, array $businesses = [], array $categories = [], array $settlements = []): array
    {
        return [
            'message' => $message,
            'source' => 'local_directory',
            'businesses' => $businesses,
            'categories' => $categories,
            'settlements' => $settlements,
        ];
    }

    private function searchBusinesses(string $input, array $categoryIds, array $settlementIds): array
    {
        $terms = $this->searchTerms($input);
        $query = Business::query()->with(['category:id,name', 'settlement:id,name'])->where('status', 'published');
        if ($terms || $categoryIds || $settlementIds) {
            $query->where(function ($builder) use ($terms, $categoryIds, $settlementIds) {
                foreach ($terms as $term) {
                    $like = '%' . addcslashes($term, '%_\\') . '%';
                    $builder->orWhere(function ($match) use ($like) {
                        $match->where('name', 'LIKE', $like)
                            ->orWhere('short_description', 'LIKE', $like)
                            ->orWhere('description', 'LIKE', $like)
                            ->orWhere('address', 'LIKE', $like)
                            ->orWhere('services', 'LIKE', $like);
                    });
                }
                if ($categoryIds) $builder->orWhereIn('category_id', $categoryIds);
                if ($settlementIds) $builder->orWhereIn('settlement_id', $settlementIds);
            });
        } else {
            return [];
        }

        return $query->orderByDesc('featured')->orderByDesc('rating')->orderBy('name')->limit(self::MAX_BUSINESS_RESULTS)
            ->get(['id', 'slug', 'name', 'category_id', 'settlement_id', 'address', 'phone', 'email', 'website', 'short_description', 'rating', 'review_count', 'opening_hours', 'services'])
            ->map(fn (Business $business) => [
                'id' => $business->id,
                'slug' => $business->slug,
                'name' => $business->name,
                'category' => $business->category?->name,
                'settlement' => $business->settlement?->name,
                'address' => $business->address,
                'phone' => $business->phone,
                'email' => $business->email,
                'website' => $business->website,
                'short_description' => $business->short_description,
                'rating' => $business->rating,
                'review_count' => $business->review_count,
                'opening_hours' => $business->opening_hours,
                'services' => $business->services,
            ])->all();
    }

    private function searchCategories(string $input): array
    {
        $ids = $this->matchingCategoryIds($input);
        $terms = $this->searchTerms($input);
        $query = Category::query()->withCount(['businesses' => fn ($businesses) => $businesses->where('status', 'published')]);
        if ($ids || $terms) {
            $query->where(function ($builder) use ($ids, $terms) {
                if ($ids) $builder->whereIn('id', $ids);
                foreach ($terms as $term) {
                    $like = '%' . addcslashes($term, '%_\\') . '%';
                    $builder->orWhere('name', 'LIKE', $like);
                }
            });
        }
        return $query->orderBy('name')->limit(20)->get(['id', 'slug', 'name', 'description'])
            ->map(fn (Category $category) => [
                'id' => $category->id, 'slug' => $category->slug, 'name' => $category->name,
                'description' => $category->description, 'business_count' => $category->businesses_count,
            ])->all();
    }

    private function searchCategoriesByIds(array $ids): array
    {
        return Category::query()->withCount(['businesses' => fn ($businesses) => $businesses->where('status', 'published')])
            ->whereIn('id', $ids)->get(['id', 'slug', 'name', 'description'])
            ->map(fn (Category $category) => [
                'id' => $category->id, 'slug' => $category->slug, 'name' => $category->name,
                'description' => $category->description, 'business_count' => $category->businesses_count,
            ])->all();
    }

    private function searchSettlements(string $input): array
    {
        $ids = $this->matchingSettlementIds($input);
        $terms = $this->searchTerms($input);
        $query = Settlement::query()->withCount(['businesses' => fn ($businesses) => $businesses->where('status', 'published')]);
        if ($ids || $terms) {
            $query->where(function ($builder) use ($ids, $terms) {
                if ($ids) $builder->whereIn('id', $ids);
                foreach ($terms as $term) {
                    $like = '%' . addcslashes($term, '%_\\') . '%';
                    $builder->orWhere('name', 'LIKE', $like);
                }
            });
        }
        return $query->orderByDesc('is_town')->orderBy('name')->limit(30)->get(['id', 'name', 'description', 'is_town'])
            ->map(fn (Settlement $settlement) => [
                'id' => $settlement->id, 'name' => $settlement->name, 'description' => $settlement->description,
                'is_town' => (bool) $settlement->is_town, 'business_count' => $settlement->businesses_count,
            ])->all();
    }

    private function searchSettlementsByIds(array $ids): array
    {
        return Settlement::query()->withCount(['businesses' => fn ($businesses) => $businesses->where('status', 'published')])
            ->whereIn('id', $ids)->get(['id', 'name', 'description', 'is_town'])
            ->map(fn (Settlement $settlement) => [
                'id' => $settlement->id, 'name' => $settlement->name, 'description' => $settlement->description,
                'is_town' => (bool) $settlement->is_town, 'business_count' => $settlement->businesses_count,
            ])->all();
    }

    private function searchTerms(string $input): array
    {
        return collect(preg_split('/\s+/u', Str::lower(Str::ascii($input))) ?: [])
            ->map(fn (string $term) => trim($term, " .,:;!?()[]{}\"'"))
            ->filter(fn (string $term) => mb_strlen($term) >= 3)
            ->reject(fn (string $term) => in_array($term, [
                'and', 'the', 'for', 'with', 'from', 'ose', 'apo', 'dhe', 'per', 'nga', 'me', 'ne', 'te',
                'biznes', 'bizneset', 'business', 'businesses', 'show', 'find', 'list', 'give', 'please',
                'category', 'categories', 'kategori', 'kategorite', 'sector', 'sektoret',
                'settlement', 'settlements', 'village', 'villages', 'town', 'vendbanimet', 'fshatrat',
            ], true))
            ->unique()->take(8)->values()->all();
    }

    private function matchingCategoryIds(string $input): array
    {
        return Category::query()->get(['id', 'name'])
            ->filter(fn (Category $category) => $this->hasFuzzyWordMatch($input, $category->name))
            ->pluck('id')->all();
    }

    private function matchingSettlementIds(string $input): array
    {
        return Settlement::query()->get(['id', 'name'])
            ->filter(fn (Settlement $settlement) => $this->hasFuzzyWordMatch($input, $settlement->name))
            ->pluck('id')->all();
    }

    private function hasFuzzyWordMatch(string $input, string $recordName): bool
    {
        foreach ($this->searchTerms($input) as $inputWord) {
            foreach ($this->searchTerms($recordName) as $recordWord) {
                similar_text($inputWord, $recordWord, $similarity);
                $distance = levenshtein($inputWord, $recordWord);
                $maxDistance = max(1, (int) floor(max(strlen($inputWord), strlen($recordWord)) * 0.38));
                if ($similarity >= 62 || $distance <= $maxDistance) return true;
            }
        }
        return false;
    }
}
