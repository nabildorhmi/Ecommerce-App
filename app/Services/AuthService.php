<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(string $name, string $email, string $password, ?string $phone = null): object
    {
        $user = User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => Hash::make($password),
            'phone'    => $phone,
        ]);
        $user->assignRole('customer');
        $user->refresh();

        return (object) [
            'plainTextToken' => $user->createToken('api')->plainTextToken,
            'user'           => $user,
        ];
    }

    public function login(string $email, string $password): object
    {
        $user = User::where('email', $email)->firstOrFail();

        if (! $user->is_active) {
            throw new AuthenticationException('Account deactivated.');
        }

        if (! Hash::check($password, $user->password)) {
            throw new AuthenticationException();
        }

        return (object) [
            'plainTextToken' => $user->createToken('api')->plainTextToken,
            'user'           => $user,
        ];
    }

    public function logout(Request $request): void
    {
        $request->user()->currentAccessToken()->delete();
    }
}
