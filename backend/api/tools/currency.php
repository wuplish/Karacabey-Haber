<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleCurrencyAPI() {
    echo json_encode(fetch_latest_currency_data());
}
?>