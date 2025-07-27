<?php
require_once 'core/Database.php';
require_once 'core/helpers.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$db = new Database();
$method = $_SERVER['REQUEST_METHOD'];

// GET url parametresi (örneğin: index.php?url=posts/by-slug/test)
$path = $_GET['url'] ?? '/';
$path = rtrim($path, '/');
$request_data = json_decode(file_get_contents('php://input'), true) ?? [];

try {

    // Login
    if ($path === 'login') {
        require_once 'api/auth/login.php';
        handleLogin($request_data);

    // Tekil post (/posts/5)
    } elseif (preg_match('/^posts\/(\d+)$/', $path, $matches)) {
        require_once 'api/news/posts.php';
        $postId = $matches[1];
        handlePosts($db, $method, $request_data, $postId);

    // Slug ile post (/posts/by-slug/slug-adi)
    } elseif (preg_match('/^posts\/by-slug\/([^\/]+)$/', $path, $matches)) {
        require_once 'api/news/by-slug.php';
        handleGetPostBySlug($db, $matches[1]);

    // Tüm postlar (/posts)
    } elseif ($path === 'posts') {
        require_once 'api/news/posts.php';
        handlePosts($db, $method, $request_data);

    // Breaking News
    } elseif ($path === '') {
        require_once 'api/news/breaking.php';
        handleBreakingNews($db);

    // Slides
    } elseif ($path === 'slides') {
        require_once 'api/news/slides.php';
        handleSlides($db);

    // Bugünkü haberler
    } elseif ($path === 'today') {
        require_once 'api/news/today.php';
        handleTodayNews($db);

    // Kategoriler (GET, POST)
    } elseif ($path === 'category') {
        require_once 'api/category/get.php';
        require_once 'api/category/manage.php';
        if ($method === 'GET') {
            handleGetCategories();
        } elseif ($method === 'POST') {
            handleManageCategory($method, $request_data);
        } else {
            throw new Exception('Method not allowed', 405);
        }

    // Kategori silme
    } elseif (preg_match('/^category\/([^\/]+)$/', $path, $matches)) {
        require_once 'api/category/manage.php';
        if ($method === 'DELETE') {
            handleManageCategory($method, $request_data, $matches[1]);
        } else {
            throw new Exception('Method not allowed', 405);
        }

    // Ayarlar - Footer
    } elseif ($path === 'settings/footer') {
        require_once 'api/settings/footer.php';
        handleFooterSettings($method, $request_data);

    // Ayarlar - Mobil Uygulamalar
    } elseif ($path === 'settings/apps') {
        require_once 'api/settings/apps.php';
        handleAppsSettings($method, $request_data);

    // Ayarlar - Logo / Metin
    } elseif ($path === 'settings/logo-text') {
        require_once 'api/settings/logo-text.php';
        handleLogoTextSettings($method, $request_data);

    // Sosyal medya - GET
    } elseif ($path === 'socialmedia' && $method === 'GET') {
        require_once 'api/settings/socialmedia.php';
        handleSocialMediaSettings($method, $request_data);

    // Sosyal medya - POST
    } elseif ($path === 'settings/socialmedia' && $method === 'POST') {
        require_once 'api/settings/socialmedia.php';
        handleSocialMediaSettings($method, $request_data);

    // Hava durumu
    } elseif (preg_match('/^api\/havadurumu\/([^\/]+)$/', $path, $matches)) {
        require_once 'api/tools/weather.php';
        handleWeatherAPI($matches[1]);

    // Döviz kuru
    } elseif ($path === 'api/doviz') {
        require_once 'api/tools/currency.php';
        handleCurrencyAPI();

    } else {
        throw new Exception('Not found', 404);
    }

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'error' => $e->getMessage(),
        'code' => $e->getCode() ?: 500
    ]);
}

$db->close();
