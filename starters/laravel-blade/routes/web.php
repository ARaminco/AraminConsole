<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('dashboard', [
    'stats' => [
        ['label' => 'Revenue', 'value' => 48250],
        ['label' => 'New users', 'value' => 1284],
        ['label' => 'Orders', 'value' => 392],
    ],
    'signups' => [12, 19, 8, 25, 17, 30, 22],
]))->name('dashboard');

Route::get('/users', fn () => view('users'))->name('users');
