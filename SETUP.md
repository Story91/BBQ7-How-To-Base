# 🚀 HowToBase Academy - Setup Guide

## Co to jest HowToBase Academy?

HowToBase Academy to interaktywna platforma edukacyjna, która uczy jak używać narzędzi Base Builder:

- **🔄 OnchainKit Swap** - wymiana tokenów na Base Mainnet
- **⛽ Paymaster** - sponsorowane transakcje (bez opłat za gaz)
- **🔐 Spend Permissions** - automatyczne subskrypcje i płatności
- **👥 Sub Accounts** - zarządzanie pod-kontami Smart Wallet
- **🎨 NFT Minting** - tworzenie NFT na Base
- **🏷️ Basenames** - system tożsamości on-chain

## 🔧 Konfiguracja

### 1. Utwórz plik .env.local

```bash
# OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_CDP_API_KEY=your_cdp_api_key_here
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="HowToBase Academy"
NEXT_PUBLIC_ONCHAINKIT_WALLET_CONFIG="smartWalletOnly"

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Paymaster Configuration (Base Sepolia)
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/your_paymaster_key

# Spender Configuration (for Spend Permissions)
SPENDER_PRIVATE_KEY=0x_your_private_key_here
NEXT_PUBLIC_SPENDER_ADDRESS=0x_your_spender_address_here

# Callback URL for Smart Wallet Profiles (development)
NEXT_PUBLIC_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app
```

### 2. Uzyskaj klucze API

#### OnchainKit API Key 🔑
1. Idź na https://onchainkit.xyz/
2. Załóż konto
3. Utwórz nowy projekt
4. Skopiuj API key do `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

#### WalletConnect Project ID 🔗
1. Idź na https://cloud.walletconnect.com/
2. Utwórz nowy projekt
3. Skopiuj Project ID do `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### CDP API Key (dla Paymaster) ⛽
1. Idź na https://docs.cdp.coinbase.com/
2. Załóż konto CDP
3. Uzyskaj API key dla Base Sepolia
4. Skopiuj do `NEXT_PUBLIC_CDP_API_KEY`

#### Spender Wallet (dla Spend Permissions) 💸
1. Utwórz nowy wallet (może być test wallet)
2. Eksportuj private key → `SPENDER_PRIVATE_KEY`
3. Skopiuj adres → `NEXT_PUBLIC_SPENDER_ADDRESS`

### 3. Skonfiguruj ngrok (dla Smart Wallet Profiles)

Smart Wallet Profiles dataCallback wymaga publicznego HTTPS endpointu. Do testowania używamy ngrok:

#### Instalacja ngrok:
```bash
# Przez npm (zalecane)
npm install -g ngrok

# Lub pobierz z https://ngrok.com/download
```

#### Konfiguracja ngrok:
1. Załóż konto na https://ngrok.com/
2. Uzyskaj authtoken
3. Skonfiguruj ngrok:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

#### Uruchomienie ngrok:
```bash
# W pierwszym terminalu - uruchom aplikację
npm run dev

# W drugim terminalu - uruchom ngrok
ngrok http 3000
```

#### Skopiuj URL do .env.local:
Po uruchomieniu ngrok, skopiuj HTTPS URL (np. `https://abc123.ngrok-free.app`) do `.env.local`:
```bash
NEXT_PUBLIC_CALLBACK_URL=https://abc123.ngrok-free.app
```

### 4. Uruchom aplikację

```bash
npm install
npm run dev
```

## 🌐 Sieci i funkcjonalności

### Base Mainnet (8453)
- ✅ **OnchainKit Swap** - wymiana tokenów z rzeczywistą płynnością
- ✅ **Basenames** - rejestracja nazw .base.eth
- ❌ Sub Accounts (tylko testnet)
- ❌ Spend Permissions (tylko testnet)

### Base Sepolia (84532)
- ❌ OnchainKit Swap (brak płynności)
- ✅ **Paymaster** - sponsorowane transakcje
- ✅ **Sub Accounts** - tworzenie pod-kont
- ✅ **Spend Permissions** - automatyczne płatności
- ✅ **Smart Wallet Profiles** - zbieranie danych użytkowników

## 🔄 Jak działają Sub Accounts?

Sub Accounts to "pod-konta" w ramach głównego Smart Wallet:

1. **Tworzenie**: Główny wallet tworzy pod-konto z określonymi uprawnieniami
2. **Zarządzanie**: Każde pod-konto ma własny budżet i limity
3. **Bezpieczeństwo**: Separacja środków i uprawnień
4. **Zastosowania**: Budżety działu, allowance dla dzieci, ograniczenia wydatków

## 💸 Jak działają Spend Permissions?

Spend Permissions to system automatycznych płatności:

1. **Autoryzacja**: Użytkownik raz autoryzuje limit (np. 10 ETH/miesiąc)
2. **Płatności**: Aplikacja może automatycznie pobierać środki w ramach limitu
3. **Kontrola**: Użytkownik może anulować pozwolenie w dowolnym momencie
4. **Zastosowania**: Subskrypcje, automatyczne płatności, recurring payments

## 🔍 Troubleshooting

### "Insufficient liquidity for this trade"
- **Problem**: Próbujesz swapować za małą kwotę lub nie masz tokenów
- **Rozwiązanie**: Kup ETH na Base Mainnet przez Coinbase lub bridguj z Ethereum

### "Swap is only available on base mainnet"
- **Problem**: Jesteś na Base Sepolia
- **Rozwiązanie**: Aplikacja automatycznie przełączy na Base Mainnet przy swap

### Spend Permissions nie działają
- **Problem**: Brak API keys lub błędna konfiguracja
- **Rozwiązanie**: Sprawdź .env.local i upewnij się, że masz wszystkie klucze

### Sub Accounts nie działają
- **Problem**: Potrzebujesz OnchainKit API key z dostępem do Sub Accounts
- **Rozwiązanie**: Skontaktuj się z zespołem OnchainKit dla dostępu do testnet features

### "POST submitDataCallbackUpdate 400 (Bad Request)"
- **Problem**: Smart Wallet Profiles dataCallback nie może połączyć się z callback URL
- **Przyczyny**: 
  - Używasz localhost zamiast publicznego HTTPS URL
  - Brak ngrok lub nieprawidłowy callback URL
  - Smart Wallet Profiles może być w fazie beta
- **Rozwiązanie**: 
  1. Skonfiguruj ngrok (patrz sekcja wyżej)
  2. Ustaw `NEXT_PUBLIC_CALLBACK_URL` w .env.local
  3. Aplikacja będzie działać w trybie fallback bez profile data collection jeśli callback nie jest dostępny

### Smart Wallet Profiles nie zbiera danych
- **Problem**: dataCallback nie działa lub zwraca 400
- **Rozwiązanie**: Aplikacja automatycznie przełączy się na tryb demo z mock danymi. Płatność będzie nadal działać.

## 🎯 Tutoriale dostępne w aplikacji

1. **Wallet Tutorial** - łączenie Smart Wallet
2. **Transaction Tutorial** - sponsorowane transakcje z Paymaster
3. **Swap Tutorial** - wymiana tokenów na Base Mainnet
4. **Spend Permissions Tutorial** - automatyczne subskrypcje
5. **Mint Tutorial** - tworzenie NFT
6. **Basenames Tutorial** - system tożsamości
7. **Checkout Tutorial** - zakup crypto

## 📞 Wsparcie

Jeśli masz problemy:
1. Sprawdź console w przeglądarce (F12)
2. Sprawdź czy masz wszystkie zmienne środowiskowe
3. Upewnij się, że jesteś na właściwej sieci
4. Sprawdź czy masz wystarczające środki w portfelu 