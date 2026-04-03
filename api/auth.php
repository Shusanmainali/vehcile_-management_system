<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once('../config/database.php');
session_start();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        if ($action === 'register') {
            register();
        } elseif ($action === 'login') {
            login();
        } elseif ($action === 'logout') {
            logout();
        } else {
            send_response(false, "Invalid action");
        }
        break;

    case 'GET':
        check_session();
        break;

    default:
        send_response(false, "Invalid request method");
}

// ---------- REGISTER ----------
function register()
{
    global $conn;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        send_response(false, "Invalid request data");
    }

    $name = isset($data['name']) ? sanitize_input($data['name']) : '';
    $email = isset($data['email']) ? sanitize_input($data['email']) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    // Basic validation
    if (empty($name) || empty($email) || empty($password)) {
        send_response(false, "All fields are required");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_response(false, "Invalid email format");
    }

    if (strlen($password) < 6) {
        send_response(false, "Password must be at least 6 characters");
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        send_response(false, "Email already registered");
    }
    $stmt->close();

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
    $stmt->bind_param("sss", $name, $email, $hashed_password);

    if ($stmt->execute()) {
        send_response(true, "Registration successful!");
    } else {
        send_response(false, "Registration failed. Please try again.");
    }

    $stmt->close();
}

// ---------- LOGIN ----------
function login()
{
    global $conn;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        send_response(false, "Invalid input data");
    }

    $email = sanitize_input($data['email']);
    $password = $data['password'];

    if (empty($email) || empty($password)) {
        send_response(false, "Email and password are required");
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        send_response(false, "Invalid email or password");
    }

    $user = $result->fetch_assoc();

    if (!password_verify($password, $user['password'])) {
        send_response(false, "Invalid email or password");
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];

    send_response(true, "Login successful", [
        "id" => $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role']
    ]);
}

// ---------- LOGOUT ----------
function logout()
{
    session_destroy();
    send_response(true, "Logout successful");
}

// ---------- CHECK SESSION ----------
function check_session()
{
    if (isset($_SESSION['user_id'])) {
        send_response(true, "Session active", [
            "id" => $_SESSION['user_id'],
            "name" => $_SESSION['user_name'],
            "email" => $_SESSION['user_email'],
            "role" => $_SESSION['user_role']
        ]);
    } else {
        send_response(false, "No active session");
    }
}

// ---------- HELPERS ----------
function sanitize_input($data)
{
    return htmlspecialchars(strip_tags(trim($data)));
}

function send_response($success, $message, $data = [])
{
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}
?>
