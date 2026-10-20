@extends('layouts.app')

@section('title', __('Users'))

@section('content')
<section class="ac-page" data-page="users">
  <header class="ac-page-head" data-ac="largetitle">
    <div class="ac-page-head__titles"><h1 class="ac-page-head__title">{{ __('Users') }}</h1></div>
  </header>
  <div class="ac-card"><div class="ac-card__body ac-card__body--flush">
    <table class="ac-table ac-table--stack">
      <thead><tr><th>{{ __('Name') }}</th><th>{{ __('Role') }}</th></tr></thead>
      <tbody>
        @foreach (\App\Models\User::limit(20)->get() as $user)
          <tr><td data-label="{{ __('Name') }}">{{ $user->name }}</td><td data-label="{{ __('Role') }}">{{ $user->role ?? '-' }}</td></tr>
        @endforeach
      </tbody>
    </table>
  </div></div>
</section>
@endsection
