<?php
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/helpers.php';

function handleBreakingNews(Database $db) {
    $today = date('Y-m-d');
    $posts = $db->query("
        SELECT id, title, image, publish_date, category, tags
        FROM posts
        WHERE status = 'published'
        AND substr(publish_date, 1, 10) = ?
        ORDER BY publish_date DESC
        LIMIT 20
    ", [$today]);

    foreach ($posts as &$post) {
        $post['tags'] = $post['tags'] ? explode(',', $post['tags']) : [];
    }

    echo json_encode($posts);
}
?>