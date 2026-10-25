<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Komandë e sigurt për krijimin / konfigurimin e administratorit
| Mos vendos kredenciale sekrete në kodin e React
|--------------------------------------------------------------------------
*/
Artisan::command('admin:create {email?} {--name=} {--password=}', function () {
    $email = $this->argument('email') ?? $this->ask('Shkruani email-in e administratorit');
    $name = $this->option('name') ?? $this->ask('Shkruani emrin e plotë', 'Administratori');
    $password = $this->option('password') ?? $this->secret('Shkruani fjalëkalimin e sigurt');

    if (!$email || !$password) {
        $this->error('Email dhe fjalëkalimi janë të detyrueshëm!');
        return 1;
    }

    $user = \App\Models\User::updateOrCreate(
        ['email' => $email],
        [
            'name' => $name,
            'password' => \Illuminate\Support\Facades\Hash::make($password),
            'role' => 'admin',
            'api_token' => null, // Do të gjenerohet dinamikisht kur të bëjë login
        ]
    );

    $this->info("✓ Administratori \"{$user->name}\" ({$user->email}) u konfigurua me sukses me fjalëkalim të enkriptuar (Bcrypt Hash)!");
    return 0;
})->purpose('Krijon ose përditëson llogarinë zyrtare të administratorit në mënyrë të sigurt nga terminali');
