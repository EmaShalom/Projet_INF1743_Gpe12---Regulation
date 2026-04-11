#!/usr/bin/env python
import os
import sys

from dotenv import load_dotenv
load_dotenv()


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d'importer Django. Vérifie qu'il est installé."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()