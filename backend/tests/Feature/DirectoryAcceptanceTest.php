<?php

namespace Tests\Feature;

use App\Models\Advertisement;
use App\Models\Business;
use App\Models\Category;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DirectoryAcceptanceTest extends TestCase
{
    use RefreshDatabase;

    private function seedDirectory(): array
    {
        $category = Category::create(['id' => 'food', 'slug' => 'food', 'name' => 'Gastronomi']);
        $otherCategory = Category::create(['id' => 'auto', 'slug' => 'auto', 'name' => 'Auto']);
        $settlement = Settlement::create(['id' => 'lipjan', 'name' => 'Lipjan', 'is_town' => true]);
        $village = Settlement::create(['id' => 'gadime', 'name' => 'Gadime']);

        return [$category, $otherCategory, $settlement, $village];
    }

    private function business(array $overrides = []): Business
    {
        [$category, , $settlement] = $this->seedDirectory();

        return Business::create(array_merge([
            'id' => 'biz-1', 'name' => 'Furrë Lipjani', 'slug' => 'furre-lipjani',
            'category_id' => $category->id, 'settlement_id' => $settlement->id,
            'address' => 'Rruga Kryesore 1', 'phone' => '+38344111222',
            'email' => null, 'website' => 'https://furra.example.test',
            'short_description' => 'Furrë lokale', 'description' => 'Bukë dhe ëmbëlsira',
            'status' => 'published', 'opening_hours' => ['monday' => '08:00-17:00'],
            'services' => ['Bukë e freskët'], 'latitude' => 42.52, 'longitude' => 21.12,
        ], $overrides));
    }

    private function adminToken(): string
    {
        User::factory()->create([
            'email' => 'acceptance-admin@example.test', 'role' => 'admin',
            'password' => Hash::make('secure-test-password'), 'api_token' => 'acceptance-admin-token',
        ]);

        return 'acceptance-admin-token';
    }

    public function test_public_search_filters_pagination_empty_results_and_business_profile(): void
    {
        $business = $this->business();
        [$food, $auto, $lipjan, $gadime] = [Category::find('food'), Category::find('auto'), Settlement::find('lipjan'), Settlement::find('gadime')];
        Business::create([
            'id' => 'biz-2', 'name' => 'Auto Lipjan', 'slug' => 'auto-lipjan', 'category_id' => $auto->id,
            'settlement_id' => $lipjan->id, 'address' => 'Rruga 2', 'phone' => '123',
            'short_description' => 'Servis', 'description' => 'Riparim automjetesh', 'status' => 'published',
            'services' => [], 'latitude' => 42.51, 'longitude' => 21.11,
        ]);
        Business::create([
            'id' => 'biz-3', 'name' => 'Furrë Gadime', 'slug' => 'furre-gadime', 'category_id' => $food->id,
            'settlement_id' => $gadime->id, 'address' => 'Rruga 3', 'phone' => '124',
            'short_description' => 'Furrë', 'description' => 'Bukë e freskët', 'status' => 'published',
            'services' => ['Bukë e freskët'], 'latitude' => 42.50, 'longitude' => 21.10,
        ]);

        $this->getJson('/api/businesses?q=furre')
            ->assertOk()->assertJsonPath('total', 2);
        $this->getJson('/api/businesses?category=food&settlement=gadime')
            ->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.id', 'biz-3');
        $this->getJson('/api/businesses?has_website=1')
            ->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.id', $business->id);
        $this->getJson('/api/businesses?q=does-not-exist')
            ->assertOk()->assertJsonPath('total', 0);
        $this->getJson('/api/businesses/biz-1')
            ->assertOk()->assertJsonPath('business.latitude', 42.52)->assertJsonPath('business.phone', '+38344111222');
    }

    public function test_public_business_pagination_is_limited_to_twelve_and_excludes_unpublished(): void
    {
        $this->business();
        for ($index = 2; $index <= 13; $index++) {
            Business::create([
                'id' => "biz-{$index}", 'name' => "Listing {$index}", 'slug' => "listing-{$index}",
                'category_id' => 'food', 'settlement_id' => 'lipjan', 'address' => 'Street', 'phone' => '123',
                'short_description' => 'Description', 'description' => 'Description', 'status' => 'published',
                'services' => [], 'latitude' => 42.5, 'longitude' => 21.1,
            ]);
        }
        Business::create([
            'id' => 'draft-1', 'name' => 'Private Draft', 'slug' => 'private-draft', 'category_id' => 'food',
            'settlement_id' => 'lipjan', 'address' => 'Street', 'phone' => '123', 'short_description' => 'Draft',
            'description' => 'Draft', 'status' => 'draft', 'services' => [],
        ]);

        $this->getJson('/api/businesses?page=1')->assertOk()->assertJsonPath('per_page', 12)->assertJsonPath('total', 13)->assertJsonCount(12, 'data');
        $this->getJson('/api/businesses?page=2')->assertOk()->assertJsonPath('current_page', 2)->assertJsonCount(1, 'data');
        $this->getJson('/api/businesses/draft-1')->assertNotFound();
    }

    public function test_admin_business_changes_are_protected_and_publicly_reflected(): void
    {
        [$category, , $settlement] = $this->seedDirectory();
        $this->postJson('/api/admin/businesses', ['name' => 'Unauthorized'])->assertUnauthorized();
        $token = $this->adminToken();

        $created = $this->withToken($token)->postJson('/api/admin/businesses', [
            'name' => 'New Lipjan Business', 'category_id' => $category->id, 'settlement_id' => $settlement->id,
            'address' => 'New street 1', 'phone' => '+38344123456', 'short_description' => 'New listing',
            'description' => 'Description', 'status' => 'published', 'latitude' => 42.52, 'longitude' => 21.12,
        ])->assertCreated();
        $id = $created->json('business.id');

        $this->getJson("/api/businesses/{$id}")->assertOk()->assertJsonPath('business.phone', '+38344123456');
        $this->withToken($token)->putJson("/api/admin/businesses/{$id}", ['phone' => '+38344999888'])->assertOk();
        $this->getJson("/api/businesses/{$id}")->assertOk()->assertJsonPath('business.phone', '+38344999888');

        Advertisement::create([
            'business_id' => $id, 'title' => 'Related ad', 'sponsor' => 'Sponsor', 'placement' => 'banner-home',
            'start_time' => now()->subDay(), 'end_time' => now()->addDay(), 'status' => 'active',
        ]);
        $this->withToken($token)->putJson("/api/admin/businesses/{$id}", ['status' => 'archived'])->assertOk();
        $this->getJson("/api/businesses/{$id}")->assertNotFound();
        $this->assertDatabaseHas('advertisements', ['business_id' => $id, 'status' => 'disabled']);
    }

    public function test_expired_advertisements_are_not_in_the_public_response(): void
    {
        $this->business();
        Advertisement::create([
            'business_id' => 'biz-1', 'title' => 'Expired ad', 'sponsor' => 'Sponsor', 'placement' => 'banner-home',
            'start_time' => now()->subDays(2), 'end_time' => now()->subDay(), 'status' => 'active',
        ]);

        $this->getJson('/api/advertisements?placement=banner-home')->assertOk()->assertJsonCount(0);
    }
}
