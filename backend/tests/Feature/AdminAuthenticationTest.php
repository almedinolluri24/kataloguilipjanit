<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'name' => 'Directory Admin',
            'email' => 'admin@example.test',
            'password' => Hash::make('correct horse battery staple'),
            'role' => 'admin',
            'api_token' => 'existing-admin-token',
        ], $attributes));
    }

    public function test_admin_login_rejects_bad_credentials_and_issues_a_rotated_token(): void
    {
        $admin = $this->admin();

        $this->postJson('/api/auth/login', ['email' => $admin->email, 'password' => 'wrong-password'])
            ->assertUnauthorized();

        $response = $this->postJson('/api/auth/login', [
            'email' => $admin->email,
            'password' => 'correct horse battery staple',
        ])->assertOk()->assertJsonPath('user.role', 'admin')->assertJsonStructure(['token']);

        $this->assertNotSame('existing-admin-token', $response->json('token'));
    }

    public function test_logout_revokes_the_token_and_protected_routes_deny_it(): void
    {
        $admin = $this->admin();

        $this->withToken('existing-admin-token')->postJson('/api/auth/logout')->assertOk();
        $this->assertNull($admin->fresh()->api_token);
        $this->withToken('existing-admin-token')->getJson('/api/admin/profile')->assertUnauthorized();
    }

    public function test_profile_updates_only_the_authenticated_admin_record(): void
    {
        $admin = $this->admin();
        $this->withToken('existing-admin-token')->putJson('/api/admin/profile', [
            'name' => 'Updated Admin',
            'email' => 'updated@example.test',
            'phone' => '+383 44 123 456',
            'bio' => 'Directory manager',
            'notification_preferences' => ['security_alerts' => true],
        ])->assertOk()->assertJsonPath('user.name', 'Updated Admin');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'name' => 'Updated Admin',
            'email' => 'updated@example.test',
            'role' => 'admin',
        ]);
    }

    public function test_non_admin_users_cannot_sign_in_to_admin_panel(): void
    {
        $user = $this->admin(['role' => 'business']);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'correct horse battery staple',
        ])->assertForbidden();
    }

    public function test_password_change_checks_the_current_password_and_rotates_the_session_token(): void
    {
        $this->admin();

        $this->withToken('existing-admin-token')->putJson('/api/admin/profile/password', [
            'current_password' => 'incorrect',
            'password' => 'a new secure password',
            'password_confirmation' => 'a new secure password',
        ])->assertUnprocessable();

        $response = $this->withToken('existing-admin-token')->putJson('/api/admin/profile/password', [
            'current_password' => 'correct horse battery staple',
            'password' => 'a new secure password',
            'password_confirmation' => 'a new secure password',
        ])->assertOk()->assertJsonStructure(['token']);

        $this->withToken('existing-admin-token')->getJson('/api/admin/profile')->assertUnauthorized();
        $this->withToken($response->json('token'))->getJson('/api/admin/profile')->assertOk();
    }

    public function test_admin_avatar_upload_is_validated_and_stored_on_the_public_disk(): void
    {
        Storage::fake('public');
        $this->admin();

        $response = $this->withToken('existing-admin-token')->put('/api/admin/profile', [
            'name' => 'Directory Admin',
            'email' => 'admin@example.test',
            'avatar' => UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg'),
        ])->assertOk();

        $this->assertStringContainsString('/storage/avatars/', $response->json('user.avatar_url'));
        $this->assertNotEmpty(Storage::disk('public')->allFiles('avatars'));
    }
}
