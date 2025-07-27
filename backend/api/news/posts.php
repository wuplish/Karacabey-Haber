<?php
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/helpers.php';

function handlePosts(Database $db, $method, $request_data, $post_id = null) {
    if ($method === 'GET' && $post_id === null) {
        // Get all posts
        $posts = $db->query("SELECT * FROM posts ORDER BY publish_date DESC");
        foreach ($posts as &$post) {
            $subheadings = $db->query("SELECT title, content FROM subheadings WHERE post_id = ?", [$post['id']]);
            $post['subheadings'] = $subheadings;
            $post['tags'] = $post['tags'] ? explode(',', $post['tags']) : [];
        }
        echo json_encode($posts);

    } elseif ($method === 'POST') {
        // Create new post
        if (!check_rate_limit(get_user_id(), 5, 5)) {
            http_response_code(429);
            echo json_encode(['detail' => 'Çok fazla istek, lütfen sonra tekrar deneyin.']);
            return;
        }

        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        $slug = create_slug($request_data['title']);
        $counter = 1;
        $original_slug = $slug;

        while ($db->query("SELECT id FROM posts WHERE slug = ?", [$slug])) {
            $slug = $original_slug . '-' . $counter;
            $counter++;
        }

        $result = $db->query("
            INSERT INTO posts (title, content, image, category, tags, status, publish_date, created_at, breaking_news, slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ", [
            $request_data['title'],
            $request_data['content'],
            $request_data['image'] ?? null,
            $request_data['category'] ?? null,
            implode(',', $request_data['tags'] ?? []),
            $request_data['status'] ?? 'draft',
            $request_data['publish_date'] ?? date('Y-m-d H:i:s'),
            date('Y-m-d H:i:s'),
            $request_data['breaking_news'] ?? 0,
            $slug
        ]);

        if ($result === false) {
            http_response_code(500);
            echo json_encode(['detail' => 'Post creation failed.']);
            return;
        }

        $post_id_inserted = $db->conn->lastInsertRowID();

        if (!empty($request_data['subheadings'])) {
            foreach ($request_data['subheadings'] as $subheading) {
                $db->query("
                    INSERT INTO subheadings (post_id, title, content)
                    VALUES (?, ?, ?)
                ", [$post_id_inserted, $subheading['title'], $subheading['content']]);
            }
        }

        echo json_encode(['message' => 'Post created', 'id' => $post_id_inserted]);

    } elseif ($method === 'PUT' && $post_id !== null) {
        // Update a specific post
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        $post = $db->query("SELECT id FROM posts WHERE id = ?", [$post_id]);
        if (empty($post)) {
            http_response_code(404);
            echo json_encode(['detail' => 'Post not found']);
            return;
        }

        $db->query("
            UPDATE posts SET
                title = ?,
                content = ?,
                image = ?,
                category = ?,
                tags = ?,
                status = ?,
                publish_date = ?,
                breaking_news = ?
            WHERE id = ?
        ", [
            $request_data['title'],
            $request_data['content'],
            $request_data['image'] ?? null,
            implode(',', $request_data['category'] ?? []), // Assuming category can be an array now
            implode(',', $request_data['tags'] ?? []),
            $request_data['status'] ?? 'draft',
            $request_data['publish_date'] ?? date('Y-m-d H:i:s'),
            $request_data['breaking_news'] ?? 0,
            $post_id
        ]);

        $db->query("DELETE FROM subheadings WHERE post_id = ?", [$post_id]);

        if (!empty($request_data['subheadings'])) {
            foreach ($request_data['subheadings'] as $subheading) {
                $db->query("
                    INSERT INTO subheadings (post_id, title, content)
                    VALUES (?, ?, ?)
                ", [$post_id, $subheading['title'], $subheading['content']]);
            }
        }

        echo json_encode(['message' => 'Post updated']);

    } elseif ($method === 'DELETE' && $post_id !== null) {
        // Delete a specific post
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        $post = $db->query("SELECT id FROM posts WHERE id = ?", [$post_id]);
        if (empty($post)) {
            http_response_code(404);
            echo json_encode(['detail' => 'Post not found']);
            return;
        }

        $db->query("DELETE FROM posts WHERE id = ?", [$post_id]);
        echo json_encode(['message' => 'Post deleted']);

    } else {
        http_response_code(405);
        echo json_encode(['detail' => 'Method not allowed']);
    }
}
?>