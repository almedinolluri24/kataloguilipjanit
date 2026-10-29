<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Service;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminServiceManagementTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        User::factory()->create([
            'email' => 'services-admin@example.test',
            'role' => 'admin',
            'password' => Hash::make('secure-test-password'),
            'api_token' => 'services-admin-token',
        ]);

        return 'services-admin-token';
    }

    private function category(): Category
    {
        return Category::create([
            'id' => 'food',
            'slug' => 'food',
            'name' => 'Gastronomi',
        ]);
    }

    private function businessWithService(string $serviceName): Business
    {
        $category = $this->category();
        $settlement = Settlement::create(['id' => 'lipjan', 'name' => 'Lipjan']);

        return Business::create([
            'id' => 'business-1',
            'name' => 'Test Restaurant',
            'slug' => 'test-restaurant',
            'category_id' => $category->id,
            'settlement_id' => $settlement->id,
            'address' => 'Test Street 1',
            'phone' => '+38344111222',
            'short_description' => 'Test listing',
            'description' => 'Test business description',
            'status' => 'published',
            'services' => [$serviceName],
        ]);
    }

    public function test_service_management_routes_require_admin_authentication(): void
    {
        $this->getJson('/api/admin/services')->assertUnauthorized();
        $this->postJson('/api/admin/services', ['name' => 'Coffee'])->assertUnauthorized();
    }

    public function test_admin_can_create_list_update_and_delete_unlinked_services(): void
    {
        $token = $this->adminToken();
        $category = $this->category();

        $created = $this->withToken($token)->postJson('/api/admin/services', [
            'name' => 'Coffee service',
            'category_id' => $category->id,
        ])->assertCreated()->assertJsonPath('service.name', 'Coffee service');

        $id = $created->json('service.id');

        $this->withToken($token)->getJson('/api/admin/services')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Coffee service']);

        $this->withToken($token)->putJson("/api/admin/services/{$id}", [
            'name' => 'Coffee and tea',
            'category_id' => null,
        ])->assertOk()->assertJsonPath('service.name', 'Coffee and tea');

        $this->withToken($token)->deleteJson("/api/admin/services/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('services', ['id' => $id]);
    }

    public function test_linked_service_cannot_be_deleted_and_renaming_updates_business_data(): void
    {
        $token = $this->adminToken();
        $this->businessWithService('Coffee');
        $service = Service::create(['name' => 'Coffee', 'category_id' => 'food']);

        $this->withToken($token)->getJson('/api/admin/services')
            ->assertOk()->assertJsonPath('0.businesses_count', 1);

        $this->withToken($token)->deleteJson("/api/admin/services/{$service->id}")
            ->assertUnprocessable();
        $this->assertDatabaseHas('services', ['id' => $service->id, 'name' => 'Coffee']);

        $this->withToken($token)->putJson("/api/admin/services/{$service->id}", ['name' => 'Coffee and tea'])
            ->assertOk();
        $this->assertSame(['Coffee and tea'], Business::findOrFail('business-1')->services);
    }

    public function test_duplicate_service_names_and_unknown_categories_are_rejected(): void
    {
        $token = $this->adminToken();
        Service::create(['name' => 'Existing service']);

        $this->withToken($token)->postJson('/api/admin/services', [
            'name' => 'Existing service',
        ])->assertUnprocessable()->assertJsonValidationErrors('name');

        $this->withToken($token)->postJson('/api/admin/services', [
            'name' => 'Another service',
            'category_id' => 'missing-category',
        ])->assertUnprocessable()->assertJsonValidationErrors('category_id');
    }
}
