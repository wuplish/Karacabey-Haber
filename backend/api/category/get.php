<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleGetCategories() {
    $categories = load_json_file('categories.json', []);
    echo json_encode($categories);
}
?>