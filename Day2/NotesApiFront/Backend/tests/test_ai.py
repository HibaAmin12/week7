from unittest.mock import MagicMock

from app.routers.ai import ask_model


def test_ask_model_returns_reply_text():

    fake_client = MagicMock()

    fake_client.chat.completions.create.return_value.choices = [
        MagicMock(
            message=MagicMock(
                content="a real-looking reply"
            )
        )
    ]

    result = ask_model(
        client=fake_client,
        model="test-model",
        message="hello"
    )

    assert result == "a real-looking reply"


def test_ask_model_returns_http_error_on_client_failure():

    fake_client = MagicMock()

    fake_client.chat.completions.create.side_effect = ConnectionError(
        "local server not running"
    )

    from fastapi import HTTPException

    try:

        ask_model(
            client=fake_client,
            model="test-model",
            message="hello"
        )

        assert False, "Expected HTTPException to be raised"

    except HTTPException as exc:

        assert exc.status_code == 500
        assert "local server not running" in exc.detail