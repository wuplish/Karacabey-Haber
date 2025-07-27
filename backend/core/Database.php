<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'karacabeygazetesi_karacabeygazetesi_veritabani';
    private $username = 'karacabeygazetesi_karacabeygazetesi_veritabani';
    private $password = 'USpwnqSq9GQJFqKCLH8B';
    public $conn;

    public function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
            
            // Tabloları kontrol et ve gerekirse oluştur
            $this->init_db();
        } catch (PDOException $e) {
            error_log("Veritabanı bağlantı hatası: " . $e->getMessage());
            die(json_encode([
                'status' => 'error',
                'message' => 'Veritabanı bağlantısı kurulamadı'
            ]));
        }
    }

    private function init_db() {
        // Posts tablosu (MariaDB uyumlu)
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
                content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
                image VARCHAR(255),
                category VARCHAR(100),
                tags TEXT,
                status ENUM('draft','published') DEFAULT 'draft',
                publish_date DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                view_count INT DEFAULT 0,
                breaking_news TINYINT(1) DEFAULT 0,
                slug VARCHAR(255) UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci
        ");

        // Subheadings tablosu (MariaDB uyumlu)
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS subheadings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
                content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci
        ");
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            
            if ($stmt === false) {
                throw new PDOException("SQL hazırlama hatası");
            }
            
            // Parametreleri bağla (1-based index)
            foreach ($params as $key => $value) {
                $stmt->bindValue($key + 1, $value);
            }
            
            $stmt->execute();
            
            // SELECT sorguları için sonuç döndür
            if (stripos($sql, 'SELECT') === 0) {
                return $stmt->fetchAll();
            }
            
            // INSERT, UPDATE, DELETE için etkilenen satır sayısı
            return $stmt->rowCount();
            
        } catch (PDOException $e) {
            error_log("SQL Hatası: " . $e->getMessage() . " - Sorgu: " . $sql);
            return false;
        }
    }

    public function close() {
        $this->conn = null;
    }
}
?>