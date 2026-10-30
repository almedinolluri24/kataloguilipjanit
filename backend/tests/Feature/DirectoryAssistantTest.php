<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DirectoryAssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_assistant_still_requires_an_authenticated_administrator(): void
    {
        $this->postJson('/api/admin/ai/chat', $this->payload('Find a café'))->assertUnauthorized();
    }

    public function test_local_assistant_searches_published_records_and_handles_voice_transcription_typos(): void
    {
        $this->seedDirectoryRecords();

        $this->postJson('/api/ai/chat', $this->payload('GASTERNOIM'))
            ->assertOk()
            ->assertJsonPath('source', 'local_directory')
            ->assertJsonPath('businesses.0.id', 'test-cafe')
            ->assertJsonPath('businesses.0.category', 'Gastronomi & Kafe')
            ->assertJsonPath('categories.0.id', 'food');

        Http::assertNothingSent();
    }

    public function test_local_assistant_can_list_real_categories_and_published_counts(): void
    {
        $this->seedDirectoryRecords();

        $this->postJson('/api/ai/chat', $this->payload('Show me categories'))
            ->assertOk()
            ->assertJsonPath('categories.0.id', 'food')
            ->assertJsonPath('categories.0.business_count', 1);
    }

    public function test_local_assistant_can_find_a_settlement(): void
    {
        $this->seedDirectoryRecords();

        $this->postJson('/api/ai/chat', $this->payload('Show settlements in Gadime'))
            ->assertOk()
            ->assertJsonPath('settlements.0.id', 'gadime')
            ->assertJsonPath('settlements.0.name', 'Gadime');
    }

    public function test_local_assistant_reports_no_match_instead_of_inventing_records(): void
    {
        $this->postJson('/api/ai/chat', $this->payload('Find a business on Mars'))
            ->assertOk()
            ->assertJsonPath('businesses', [])
            ->assertJsonPath('source', 'local_directory');
        Http::assertNothingSent();
    }

    public function test_general_questions_use_openai_responses_api(): void
    {
        config(['services.openai.api_key' => 'test-secret', 'services.openai.model' => 'test-model']);
        Http::fake(['https://api.openai.com/v1/responses' => Http::response([
            'output' => [[
                'type' => 'message', 'content' => [['type' => 'output_text', 'text' => 'Përshëndetje!']],
            ]],
        ])]);

        $this->postJson('/api/ai/chat', $this->payload('Si funksionon fotosinteza?'))
            ->assertOk()->assertJsonPath('source', 'openai')->assertJsonPath('message', 'Përshëndetje!');

        Http::assertSent(fn ($request) => $request->url() === 'https://api.openai.com/v1/responses'
            && $request->hasHeader('Authorization', 'Bearer test-secret')
            && $request['model'] === 'test-model'
            && $request['store'] === false);
    }

    public function test_openai_quota_errors_are_returned_without_provider_details(): void
    {
        config(['services.openai.api_key' => 'test-secret']);
        Http::fake(['https://api.openai.com/v1/responses' => Http::response(['error' => [
            'code' => 'credit_balance_exhausted', 'message' => 'private provider detail',
        ]], 429)]);

        $this->postJson('/api/ai/chat', $this->payload('Më trego një shaka'))
            ->assertStatus(429)->assertJsonPath('message', 'Projekti OpenAI API i lidhur me këtë çelës nuk ka kredi të disponueshme. Shtoni faturimin ose kredi në atë projekt dhe provoni përsëri.')
            ->assertJsonMissing(['error' => ['message' => 'private provider detail']]);
    }

    public function test_assistant_validates_language_history_and_message_size(): void
    {
        $this->postJson('/api/ai/chat', [
            'language' => 'fr',
            'messages' => [['role' => 'user', 'content' => str_repeat('x', 4001)]],
        ])->assertUnprocessable();
    }

    private function payload(string $content, string $language = 'sq'): array
    {
        return [
            'language' => $language,
            'messages' => [['role' => 'user', 'content' => $content]],
        ];
    }

    private function seedDirectoryRecords(): void
    {
        DB::table('categories')->insert([
            'id' => 'food', 'slug' => 'food', 'name' => 'Gastronomi & Kafe',
            'icon' => 'Coffee', 'color' => '#0d9488', 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('settlements')->insert([
            'id' => 'gadime', 'name' => 'Gadime', 'is_town' => false,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $business = [
            'id' => 'test-cafe', 'slug' => 'test-cafe-gadime', 'name' => 'Test Café Gadime',
            'category_id' => 'food', 'settlement_id' => 'gadime', 'address' => 'Main Street 1',
            'phone' => '+38344111222', 'email' => null, 'website' => null,
            'short_description' => 'Coffee and local desserts', 'description' => 'A test café.',
            'rating' => 4.8, 'review_count' => 2, 'featured' => false, 'status' => 'published',
            'services' => json_encode(['coffee']), 'opening_hours' => null,
            'is_demo' => false, 'created_at' => now(), 'updated_at' => now(),
        ];
        DB::table('businesses')->insert($business);
        DB::table('businesses')->insert(array_merge($business, [
            'id' => 'draft-cafe', 'slug' => 'draft-cafe-gadime', 'name' => 'Draft Café Gadime', 'status' => 'draft',
        ]));
    }
}
