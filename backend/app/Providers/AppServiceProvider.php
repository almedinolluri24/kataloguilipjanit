<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('assistant-chat', function (Request $request) {
            $userId = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return [
                Limit::perMinute(8)->by('assistant-minute:' . $userId),
                Limit::perDay(100)->by('assistant-day:' . $userId),
            ];
        });

        RateLimiter::for('assistant-public-chat', function (Request $request) {
            return [
                Limit::perMinute(5)->by('assistant-public-minute:' . $request->ip()),
                Limit::perDay(60)->by('assistant-public-day:' . $request->ip()),
            ];
        });
    }
}
