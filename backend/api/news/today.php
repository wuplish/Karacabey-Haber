<?php
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/helpers.php';

function handleTodayNews(Database $db) {
    $today = date('Y-m-d');
    $posts = $db->query("
        SELECT * FROM posts
        WHERE DATE(publish_date) = ?
        AND status = 'published'
        ORDER BY publish_date DESC
    ", [$today]);

    foreach ($posts as &$post) {
        $post['tags'] = $post['tags'] ? explode(',', $post['tags']) : [];
    }

    echo json_encode($posts);
}
?>