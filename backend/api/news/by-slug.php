<?php
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/helpers.php';

function handleGetPostBySlug(Database $db, $slug) {
    $post = $db->query("SELECT * FROM posts WHERE slug = ?", [$slug]);
    if (empty($post)) {
        http_response_code(404);
        echo json_encode(['detail' => 'Post not found']);
        return;
    }

    $post = $post[0];
    $subheadings = $db->query("SELECT title, content FROM subheadings WHERE post_id = ?", [$post['id']]);

    $post['subheadings'] = $subheadings;
    $post['tags'] = $post['tags'] ? explode(',', $post['tags']) : [];

    echo json_encode($post);
}
?>