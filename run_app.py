# -*- coding: utf-8 -*-
"""
Entry point wrapper untuk mengemas aplikasi Streamlit ke dalam file .exe menggunakan PyInstaller.
Dibuat untuk: Kalkulator Rancob by.M.A.R
"""
import os
import sys
import streamlit.web.cli as stcli

def main():
    if getattr(sys, 'frozen', False):
        # Saat dijalankan sebagai file executable (.exe) hasil kompilasi PyInstaller
        base_dir = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    app_path = os.path.join(base_dir, "app.py")

    # Menjalankan Streamlit secara otomatis
    sys.argv = [
        "streamlit",
        "run",
        app_path,
        "--global.developmentMode=false",
        "--server.headless=false",
    ]
    sys.exit(stcli.main())

if __name__ == "__main__":
    main()
