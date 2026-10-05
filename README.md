# DailyTrack - Osobní organizér a Habit Tracker

Moderní a minimalistická aplikace pro správu denních úkolů, sledování návyků se streaky a přehlednou vizualizaci osobní produktivity.

Aplikace běží plně offline v Pythonu s grafickým rozhraním **PySide6 (Qt)**, lokální **SQLite** databází a grafy v **Matplotlib**.

---

## 🌟 Klíčové vlastnosti

### 1. Dnes (Dashboard)
- Okamžitý přehled pro aktuální den (dnešní úkoly, zpožděné povinnosti, návyky k odškrtnutí).
- Rychlé označení splnění jedním kliknutím přímo z dashboardu.
- Souhrnné metriky dne a aktuální aktivní streak.

### 2. Správa úkolů (Úkoly)
- **Vytváření, úprava a mazání** úkolů s potvrzovacím dialogem.
- Pole: Název, volitelný podrobný popis, priorita a termín splnění.
- **Priority:** Nízká (zelená), Střední (oranžová), Vysoká (červená).
- **Opakování:** Žádné, Denně, Týdně, Měsíčně. Při dokončení opakovaného úkolu aplikace automaticky vytvoří další instanci s odpovídajícím posunem termínu!
- **Filtrace a vyhledávání:** Okamžité fulltextové vyhledávání, filtry podle stavu (Všechny / K vyřízení / Dokončené) a podle priority.

### 3. Sledování návyků (Návyky)
- Vytvoření vlastních návyků s volitelnou barvou (např. Cvičení, Čtení, Pití vody, Meditace).
- **Streaks (Série splněných dní):**
  - **Aktuální série (Current Streak):** počet po sobě jdoucích dní.
  - **Rekordní série (Best Streak):** historické maximum bez přerušení.
- **Interaktivní 7denní mřížka:** Každý den v posledním týdnu má své tlačítko – můžete kliknout na kterýkoliv den a zpětně ho označit nebo odznačit.

### 4. Statistiky a vizualizace (Statistiky)
- Karty s KPI: Celkový počet dokončených a čekajících úkolů, úspěšnost v procentech, nejdelší streak.
- **Prstencový / koláčový graf:** Poměr splněných a čekajících úkolů.
- **Sloupcový graf:** Denní aktivita splněných návyků za posledních 14 dní.
- Grafy se automaticky přebarvují a ladí s aktivním tématem.

### 5. Nastavení a Vzhled
- **Tmavý a Světlý režim:** Přepínání tlačítkem v postranním panelu nebo v nastavení s okamžitou aplikací.
- Volba motivu se ukládá do databáze a přetrvává po restartu.
- Správa databáze: informace o velikosti SQLite souboru, možnost vyčistit hotové úkoly nebo resetovat data.
- Responzivní design navržený i pro menší displeje (od 840x540 px).

---

## 🚀 Instalace a spuštění

### Požadavky
- Python 3.10 nebo novější

### 1. Rychlé spuštění na Windows (Jedním kliknutím)
Stačí dvakrát kliknout na soubor **`spustit.bat`** (nebo `start.bat`).
Skript automaticky:
- ověří přítomnost Pythonu,
- doinstaluje potřebné knihovny,
- spustí aplikaci a otevře ji v prohlížeči.

### 2. Manuální spuštění přes terminál

Nainstalujte závislosti:
```bash
pip install -r requirements.txt
```

Spusťte webovou verzi (přístupnou i z jiných PC / mobilů v síti):
```bash
python run.py
```
*Server automaticky vypíše adresu pro přístup z tohoto počítače i z ostatních zařízení ve stejné Wi-Fi síti (např. `http://192.168.x.x:8000`).*

Spusťte desktopovou verzi (PySide6 Qt okno):
```bash
python main.py
```

### 3. Nasazení na internet ZDARMA (24/7 online web)

Aplikace je plně připravena pro bezplatný cloudový běh na **[Render.com](https://render.com)** nebo **Railway**:

1. Nahrajte tento projekt do svého GitHub repozitáře.
2. Zaregistrujte se zdarma na [Render.com](https://render.com) (stačí přihlášení přes GitHub).
3. Klikněte na **New +** &rarr; **Blueprint** (nebo **Web Service**) a vyberte repozitář DailyTrack.
4. Render automaticky rozpozná konfigurační soubor `render.yaml` a aplikaci sestaví.
5. Během 2 minut získáte vlastní veřejnou internetovou adresu (např. `https://dailytrack-xxxx.onrender.com`), kterou můžete otevřít na jakémkoliv počítači nebo telefonu na světě.

### 4. Rychlé sdílení na internet bez registrace (Cloudflare Tunnel)
Pokud chcete aplikaci okamžitě zpřístupnit komukoliv na internetu ze svého PC:
```bash
cloudflared tunnel --url http://localhost:8000
```
Získáte dočasnou veřejnou HTTPS adresu (např. `https://xyz.trycloudflare.com`), která funguje odkudkoliv.

### 5. Spuštění v Dockeru (jakýkoliv OS)
```bash
docker compose up -d
```


---

## 📁 Struktura projektu

```
DailyTrack/
├── main.py                  # Hlavní vstupní bod, okno MainWindow, přepínání stránek a témat
├── requirements.txt         # Seznam závislostí (PySide6, matplotlib)
├── README.md                # Dokumentace aplikace
├── database.py              # SQLite vrstva (databázové schéma, transakce, výpočty streaků a statistik)
├── models.py                # Datové třídy (Task, Habit, Priority, Recurrence)
├── theme.py                 # Moderní QSS styly (Light & Dark theme), barevná paleta
├── views/
│   ├── __init__.py
│   ├── sidebar.py           # Levý navigační panel s kategoriemi a přepínačem motivu
│   ├── today_view.py        # Obrazovka "Dnes" (souhrn, dnešní návyky a úkoly)
│   ├── tasks_view.py        # Správa úkolů (filtrace, karty, CRUD)
│   ├── habits_view.py       # Sledování návyků (streaky, 7denní interaktivní přehled)
│   ├── stats_view.py        # Statistiky (KPI, Matplotlib grafy)
│   └── settings_view.py     # Nastavení aplikace a správa databáze
└── widgets/
    ├── __init__.py
    ├── task_dialog.py       # Dialog pro přidání a úpravu úkolu s validací
    ├── habit_dialog.py      # Dialog pro přidání a úpravu návyku s výběrem barvy
    └── chart_widget.py      # Matplotlib FigureCanvas widgety pro PySide6
```

---

## 💾 Databáze a ukládání dat
Veškerá data se ukládají lokálně do souboru `dailytrack.db` přímo ve složce aplikace:
- **`tasks`**: evidence všech úkolů včetně termínů, priorit a opakování.
- **`habits`**: definice návyků a jejich barev.
- **`habit_logs`**: jednotlivá denní splnění návyků (unikátní dvojice návyk + datum).
- **`settings`**: uživatelská konfigurace (např. vybraný grafický motiv).
