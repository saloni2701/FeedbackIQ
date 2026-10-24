from app.nlp.analyzer import detect_aspect, estimate_severity, is_feature_request


def test_aspect_detection():
    assert detect_aspect("My card was charged twice and retrying the payment failed.") == "Billing and payments"
    assert detect_aspect("Everything is very slow since the update") == "Speed and performance"
    assert detect_aspect("Support replies take too long") == "Customer support"
    assert detect_aspect("Hello there") == "Other"


def test_feature_request_detection():
    assert is_feature_request("Please add a way to download reports as PDF.")
    assert is_feature_request("It would be nice to have dark mode.")
    assert not is_feature_request("The app crashes when I open it.")


def test_severity_uses_highest_level():
    assert estimate_severity(["It is slow", "I was charged twice"]) == "Critical"
    assert estimate_severity(["Replies take too long"]) == "Moderate"
    assert estimate_severity(["Not my favourite colour"]) == "Minor"
