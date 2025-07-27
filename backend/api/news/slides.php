<?php
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/helpers.php';

function handleSlides(Database $db) {
    $category = $_GET['category'] ?? null;

    if ($category) {
        $posts = $db->query("
            SELECT id, title, image, publish_date
            FROM posts
            WHERE status = 'published' AND category = ?
            ORDER BY publish_date DESC
            LIMIT 15
        ", [$category]);
    } else {
        $posts = $db->query("
            SELECT id, title, image, publish_date
            FROM posts
            WHERE status = 'published'
            ORDER BY publish_date DESC
            LIMIT 15
        ");
    }

    echo json_encode($posts);
}
?>