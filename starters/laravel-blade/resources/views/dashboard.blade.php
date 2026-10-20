@extends('layouts.app')

@section('title', __('Dashboard'))

@section('content')
<section class="ac-page" data-page="dashboard">
  <header class="ac-page-head" data-ac="largetitle">
    <div class="ac-page-head__titles">
      <h1 class="ac-page-head__title">{{ __('Dashboard') }}</h1>
      <p class="ac-page-head__sub">{{ __('Revenue, signups and activity at a glance.') }}</p>
    </div>
  </header>

  <div class="ac-bento ac-stagger">
    @foreach ($stats as $stat)
      <div class="ac-card ac-span-xs-6 ac-span-md-4 ac-span-4"><div class="ac-card__body">
        <div class="ac-stat">
          <span class="ac-stat__label">{{ $stat['label'] }}</span>
          <span class="ac-stat__value" data-ac="counter" data-to="{{ $stat['value'] }}">0</span>
        </div>
      </div></div>
    @endforeach

    <div class="ac-card ac-span-md-12 ac-span-4">
      <div class="ac-card__body">
        <div class="ac-chart-slot" data-ac="chart"
             data-ac-config='@json(["type" => "bar", "series" => [["name" => "Signups", "data" => $signups]]])'></div>
      </div>
    </div>
  </div>
</section>
@endsection
