# 📱 IronReign APK Build Anleitung

## ✅ Build-Konfiguration ist vorbereitet!

---

## 🎯 APK ERSTELLEN - SCHRITT FÜR SCHRITT

### **Option 1: EAS Build (Empfohlen - Cloud Build)**

#### Voraussetzungen:
- Expo Account (kostenlos bei expo.dev registrieren)
- Internet-Verbindung

#### Schritte:

**1. Expo Account erstellen (falls nicht vorhanden):**
```bash
# In Terminal auf Ihrem lokalen Computer
npx expo register
```

**2. Bei EAS anmelden:**
```bash
cd /app/frontend
eas login
```

**3. APK Build starten (Preview/Test APK):**
```bash
# Für Test-APK (kann ohne Google Play installiert werden)
eas build --platform android --profile preview

# Der Build läuft in der Cloud (~10-15 Minuten)
# Sie erhalten einen Download-Link per Email und im Terminal
```

**4. APK herunterladen:**
- Link aus Terminal kopieren ODER
- Auf expo.dev/accounts/[username]/projects/ironreign/builds gehen
- APK herunterladen

**5. APK auf Android installieren:**
- APK-Datei auf Android-Gerät übertragen
- Öffnen und installieren
- "Aus unbekannten Quellen installieren" erlauben (falls gefragt)

---

### **Option 2: Production Build für Google Play Store**

```bash
eas build --platform android --profile production

# Erstellt eine .aab Datei (Android App Bundle)
# Diese kann direkt auf Google Play hochgeladen werden
```

---

## 📁 ERSTELLTE BUILD-KONFIGURATIONEN

### **1. eas.json** ✅
Erstellt in `/app/frontend/eas.json`

**Build Profile:**
- **development:** Für Development Client
- **preview:** Erstellt APK für Testing (empfohlen zum Testen)
- **production:** Erstellt App Bundle für Play Store

### **2. app.json** ✅
Aktualisiert in `/app/frontend/app.json`

**Konfiguriert:**
- App Name: "IronReign"
- Package: com.ironreign.app
- Version: 1.0.0 (versionCode: 1)
- Dark Theme als Standard
- Camera & Storage Permissions
- Icon & Splash Screen Konfiguration

---

## 🔧 ALTERNATIVE: LOKALER BUILD (Fortgeschritten)

### **Mit expo-dev-client (Lokal):**

```bash
cd /app/frontend

# Android SDK & Build Tools benötigt
# Nicht empfohlen in Container-Umgebung

# npx expo run:android
```

**Hinweis:** Lokaler Build benötigt:
- Android Studio
- Android SDK
- Java JDK
- Gradle

Dies ist in einer Container-Umgebung komplex. **EAS Build wird empfohlen.**

---

## 📊 BUILD-STATUS

### **✅ Was ist vorbereitet:**
1. ✅ `eas.json` - EAS Build Konfiguration
2. ✅ `app.json` - App Metadata aktualisiert
3. ✅ Package Name: com.ironreign.app
4. ✅ Permissions konfiguriert (Camera, Storage)
5. ✅ App Icons & Splash Screen definiert

### **❗ Was Sie tun müssen:**
1. Expo Account erstellen (expo.dev/signup)
2. `eas login` ausführen
3. `eas build --platform android --profile preview` ausführen
4. 10-15 Minuten warten
5. APK herunterladen & installieren

---

## 🎨 APP ICONS ERSTELLEN (OPTIONAL)

### **Icons benötigt:**
- `icon.png` - 1024x1024 px (App Icon)
- `adaptive-icon.png` - 1024x1024 px (Android Adaptive Icon)
- `splash-icon.png` - 1284x2778 px (Splash Screen)
- `favicon.png` - 48x48 px (Web Favicon)

**Icon Design:**
- Hauptfarbe: #1a1a1a (Dark Background)
- Akzent: #ff1e00 (Red)
- Symbol: Dumbbell oder "IR" Logo

**Tools zum Erstellen:**
- Canva (canva.com)
- Figma (figma.com)
- Adobe Illustrator
- Online: https://www.appicon.co/

---

## 💡 WICHTIGE HINWEISE

### **EAS Build Vorteile:**
- ✅ Keine lokale Android-Konfiguration nötig
- ✅ Cloud-basiert (funktioniert von überall)
- ✅ Automatische Code-Signierung
- ✅ Optimierte Builds
- ✅ Kostenlos für Basic Builds

### **Build-Zeiten:**
- **Preview APK:** ~10-15 Minuten
- **Production Bundle:** ~10-15 Minuten

### **Kosten:**
- **Free Tier:** Unbegrenzte Builds (mit Warteschlange)
- **Production Tier:** $29/Monat (Priority Builds, mehr Features)

---

## 🚀 SCHNELLSTART FÜR APK-ERSTELLUNG

```bash
# 1. Terminal öffnen und zu Frontend navigieren
cd /app/frontend

# 2. Bei Expo anmelden
eas login
# (Email & Passwort von expo.dev Account eingeben)

# 3. Build konfigurieren (falls gefragt)
eas build:configure

# 4. APK Build starten
eas build --platform android --profile preview

# 5. Warten auf Build-Fertigstellung (10-15 Min)
# Link wird im Terminal angezeigt

# 6. APK herunterladen & auf Android installieren
```

---

## 📱 APK AUF ANDROID INSTALLIEREN

### **Methode 1: Direkt vom Gerät**
1. Build-Link auf Android-Gerät öffnen
2. APK herunterladen
3. Öffnen → "Installieren" wählen
4. Bei Warnung: "Trotzdem installieren" wählen

### **Methode 2: Via ADB (Entwickler)**
```bash
# APK auf Computer herunterladen
# Dann mit ADB installieren:
adb install ironreign-build.apk
```

### **Methode 3: Via USB**
1. APK auf Computer herunterladen
2. Per USB auf Android-Gerät kopieren
3. Datei-Manager auf Android öffnen
4. APK antippen → Installieren

---

## 🔐 CODE-SIGNIERUNG

### **Automatisch mit EAS:**
- EAS erstellt automatisch Signing Keys
- Keys werden sicher in Expo Cloud gespeichert
- Kein manuelles Keystore-Management nötig

### **Für Google Play Store:**
- EAS erstellt automatisch korrekt signierte AAB
- Play App Signing wird automatisch konfiguriert

---

## ❓ TROUBLESHOOTING

### **Problem: "eas command not found"**
**Lösung:**
```bash
npm install -g eas-cli
```

### **Problem: "Not logged in"**
**Lösung:**
```bash
eas login
```

### **Problem: Build schlägt fehl**
**Lösung:**
1. Logs prüfen: `eas build:list`
2. Details ansehen: `eas build:view [build-id]`
3. Häufige Ursachen:
   - Fehlende Dependencies
   - Ungültige app.json Konfiguration
   - Netzwerkprobleme

### **Problem: APK lässt sich nicht installieren**
**Lösung:**
1. "Aus unbekannten Quellen installieren" aktivieren:
   - Einstellungen → Sicherheit → Unbekannte Quellen
2. APK erneut herunterladen (keine Korruption)
3. Platz auf Gerät prüfen (mindestens 100 MB frei)

---

## 📊 ZUSAMMENFASSUNG

### **✅ Vorbereitet:**
- EAS Build Konfiguration
- App Metadata
- Package Name & Permissions
- Build Profiles

### **👤 Ihr nächster Schritt:**
1. Expo Account erstellen (expo.dev)
2. `cd /app/frontend && eas login`
3. `eas build --platform android --profile preview`
4. 10-15 Minuten warten
5. APK herunterladen
6. Auf Android installieren & testen

---

## 🎯 ZIEL ERREICHT

**Die Build-Konfiguration ist vollständig vorbereitet!**

Sie können jetzt mit einem einfachen Befehl eine APK erstellen:

```bash
cd /app/frontend && eas build --platform android --profile preview
```

**Geschätzte Zeit bis zur installierbaren APK:** ~15 Minuten

---

🏋️ **IronReign - Ready to Build!** 🏆
