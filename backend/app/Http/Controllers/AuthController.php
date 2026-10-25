<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Regjistrimi i administratorit përmes kodit të ftesës ose miratimit.
     * Fjalëkalimi ruhet në formë Hash (Bcrypt).
     * Regjistrimi administrativ kërkon një kod ftese me afat ose kod të konfiguruar në server.
     */
    /**
     * Dërgimi i kodit të ftesës në email-in e administratorit.
     * Ruan kodin e gjeneruar për email-in e kërkuar dhe e dërgon/regjistron në log.
     */
    public function sendInviteCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:150',
        ], [
            'email.required' => 'Ju lutem shkruani email-in e administratorit.',
            'email.email' => 'Format i pavlefshëm i email-it.',
        ]);

        $email = strtolower(trim($validated['email']));

        if (!in_array($email, config('services.admin_registration_emails', []), true)) {
            return response()->json([
                'message' => 'Regjistrimi i administratorëve nuk është i hapur për këtë email. Kontakto administratorin ekzistues.',
            ], 403);
        }

        // Gjenero kod 6-shifror unik p.sh. LIP-849201
        $code = 'LIP-' . strtoupper(Str::random(6));

        // Ruaj kodin për 15 minuta në cache
        cache()->put('admin_invite_' . $email, $code, now()->addMinutes(15));

        // Dërgo email ose regjistro në sistemin e postës Laravel
        try {
            \Illuminate\Support\Facades\Mail::raw("Përshëndetje!\n\nKodi juaj zyrtar i ftesës për regjistrim si administrator në Panelin e Katalogut të Lipjanit është:\n\n{$code}\n\nKy kod është i vlefshëm për 15 minuta.\n\nKomuna e Lipjanit - Sistemi Digjital", function ($msg) use ($email) {
                $msg->to($email)->subject('Kodi i Ftesës Administrative - Katalogu Lipjan');
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Nuk mund të dërgohej email me SMTP: " . $e->getMessage());
            cache()->forget('admin_invite_' . $email);
            return response()->json([
                'message' => 'Email-i i ftesës nuk mund të dërgohej. Kontrolloni konfigurimin e postës dhe provoni përsëri.',
            ], 503);
        }

        \Illuminate\Support\Facades\Log::info('Kodi i ftesës administrative u gjenerua', ['email' => $email]);

        return response()->json([
            'message' => "Nëse email-i është i vlefshëm dhe i konfiguruar, kodi i ftesës do të dërgohet.",
            'email' => $email,
        ]);
    }

    /**
     * Regjistrimi i administratorit përmes kodit të ftesës ose miratimit.
     * Fjalëkalimi ruhet në formë Hash (Bcrypt).
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'confirmed', Password::min(8)],
            'invite_code' => 'required|string',
        ], [
            'name.required' => 'Emri i plotë është i detyrueshëm.',
            'email.required' => 'Email adresa është e detyrueshme.',
            'email.unique' => 'Një llogari me këtë email tashmë ekziston.',
            'password.required' => 'Fjalëkalimi është i detyrueshëm.',
            'password.min' => 'Fjalëkalimi duhet të ketë së paku 8 karaktere.',
            'password.confirmed' => 'Konfirmimi i fjalëkalimit nuk përputhet.',
            'invite_code.required' => 'Kodi i ftesës administrative është i detyrueshëm për siguri.',
        ]);

        $email = strtolower(trim($validated['email']));
        $cachedCode = cache()->get('admin_invite_' . $email);

        if (!in_array($email, config('services.admin_registration_emails', []), true)
            || !$cachedCode
            || !hash_equals($cachedCode, trim($validated['invite_code']))) {
            return response()->json([
                'message' => 'Kodi i ftesës administrative nuk është i vlefshëm ose ka skaduar. Klikoni "Më dërgo kodin në email" për të marrë një kod të ri.',
            ], 403);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'api_token' => Str::random(60),
        ]);

        // Kodi hiqet para se të kthehet përgjigjja për të mos lejuar ripërdorim.
        cache()->forget('admin_invite_' . $email);

        return response()->json([
            'message' => 'Llogaria e administratorit u regjistrua me sukses me fjalëkalim të enkriptuar.',
            'token' => $user->api_token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }
    /**
     * Shikimi i profilit të administratorit të autentikuar.
     * Identiteti vjen nga token-i i Bearer, jo nga input-i i përdoruesit.
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'bio'        => $user->bio,
                'avatar_url' => $user->avatar_url,
                'role'       => $user->role,
                'notification_preferences' => $user->notification_preferences,
                'status'     => 'aktiv',
                'created_at' => $user->created_at?->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Përditëso emrin dhe email-in e administratorit të autentikuar.
     * Nuk lejohet ndryshimi i rolit nga ky endpoint.
     * Email unik duke përjashtuar përdoruesin aktual.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'sometimes|required|string|min:2|max:100',
            'email' => 'required|email|max:150|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'bio'   => 'sometimes|nullable|string|max:500',
            'notification_preferences' => 'sometimes|array',
            'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,webp|max:5120',
        ], [
            'name.required'  => 'Emri i plotë është i detyrueshëm.',
            'name.min'       => 'Emri duhet të ketë së paku 2 karaktere.',
            'name.max'       => 'Emri nuk mund të kalojë 100 karaktere.',
            'email.required' => 'Email adresa është e detyrueshme.',
            'email.email'    => 'Format i pavlefshëm i email-it.',
            'email.unique'   => 'Një llogari tjetër me këtë email tashmë ekziston.',
            'phone.max'      => 'Numri i telefonit nuk mund të kalojë 20 karaktere.',
            'bio.max'        => 'Bioja nuk mund të kalojë 500 karaktere.',
        ]);

        if (array_key_exists('name', $validated)) $user->name = $validated['name'];
        if (array_key_exists('email', $validated)) $user->email = strtolower(trim($validated['email']));
        if (array_key_exists('phone', $validated)) $user->phone = $validated['phone'];
        if (array_key_exists('bio', $validated)) $user->bio = $validated['bio'];
        
        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarPath = $avatar->store('avatars', 'public');
            $user->avatar_url = Storage::disk('public')->url($avatarPath);
        }

        // Handle notification preferences
        if ($request->has('notification_preferences')) {
            $preferences = $request->input('notification_preferences');
            $user->notification_preferences = is_string($preferences) ? json_decode($preferences, true, 512, JSON_THROW_ON_ERROR) : $preferences;
        }

        // Roli NUK ndryshohet — mbrojtje nga privilege escalation
        $user->save();

        // Klienti rifreshon user-in lokal vetë pas përgjigjes

        Log::info('Profili u përditësua', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json([
            'message' => 'Profili u përditësua me sukses.',
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'bio'        => $user->bio,
                'avatar_url' => $user->avatar_url,
                'role'       => $user->role,
                'notification_preferences' => $user->notification_preferences,
            ],
        ]);
    }

    /**
     * Ndrysho fjalëkalimin e administratorit të autentikuar.
     * Verifikon fjalëkalimin aktual, hash-on të riun. Nuk regjistron fjalëkalime.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password'      => 'required|string',
            'password'              => ['required', 'string', 'min:8', 'confirmed', Password::min(8)],
            'password_confirmation' => 'required|string',
        ], [
            'current_password.required' => 'Fjalëkalimi aktual është i detyrueshëm.',
            'password.required'         => 'Fjalëkalimi i ri është i detyrueshëm.',
            'password.min'              => 'Fjalëkalimi i ri duhet të ketë së paku 8 karaktere.',
            'password.confirmed'        => 'Konfirmimi i fjalëkalimit nuk përputhet.',
            'password_confirmation.required' => 'Konfirmimi i fjalëkalimit është i detyrueshëm.',
        ]);

        // Verifiko fjalëkalimin aktual
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Fjalëkalimi aktual është i pasaktë.',
                'errors'  => ['current_password' => ['Fjalëkalimi aktual është i pasaktë.']],
            ], 422);
        }

        // Hash-o fjalëkalimin e ri — NUK regjistrohet në log
        $user->password = Hash::make($validated['password']);
        $user->api_token = Str::random(60);
        $user->save();

        Log::info('Fjalëkalimi u ndryshua', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Fjalëkalimi u ndryshua me sukses.',
            'token' => $user->api_token,
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Kredencialet janë të pasakta. Ju lutemi kontrolloni email-in dhe fjalëkalimin.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Nuk keni autorizim për të hyrë në panelin e administrimit.',
            ], 403);
        }

        // Generate / refresh API token
        $user->api_token = Str::random(60);
        $user->save();

        return response()->json([
            'message' => 'Hyrja u krye me sukses.',
            'token' => $user->api_token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            $user = User::where('api_token', $token)->first();
            if ($user) {
                $user->api_token = null;
                $user->save();
            }
        }

        return response()->json([
            'message' => 'Dalja u krye me sukses.',
        ]);
    }

    public function me(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'I paautorizuar.'], 401);
        }

        $user = User::where('api_token', $token)->first();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'I paautorizuar ose sesioni ka skaduar.'], 401);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
