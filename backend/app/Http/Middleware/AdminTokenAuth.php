<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AdminTokenAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Qasja u refuzua. Kërkohet autentikim si administrator.',
            ], 401);
        }

        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Sesioni ka skaduar ose nuk është i vlefshëm.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Nuk keni të drejta administrative për të kryer këtë veprim.',
            ], 403);
        }

        // Bashkëngjit përdoruesin në request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}
