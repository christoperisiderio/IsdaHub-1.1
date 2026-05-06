# IsdaHub PH

IsdaHub PH is a comprehensive seafood marketplace application connecting local fishermen with buyers. Built with React Native and Expo, it offers a seamless experience for both parties, facilitating direct trade, order tracking, and communication.

## 🚀 Technologies Used

### Core Framework & Architecture
- **React Native** - Mobile framework for building cross-platform native apps.
- **Expo** - Framework and platform for universal React applications.
- **TypeScript** - Strongly typed programming language that builds on JavaScript.

### Navigation & Routing
- **Expo Router** - File-based routing for React Native and web applications.
- **React Navigation** - Routing and navigation for React Native apps.

### State Management
- **Zustand** - A small, fast, and scalable bearbones state-management solution.
- **AsyncStorage** - Unencrypted, asynchronous, persistent, key-value storage system for React Native.

### UI & Styling
- **Custom UI Components** - Reusable custom components (Buttons, Cards, Inputs, Badges).
- **Expo Google Fonts** - Using `Inter` and `Nunito` for typography.
- **Expo Linear Gradient** - For visually appealing gradient backgrounds.
- **Expo Status Bar** - Managing the application status bar.

### Animations & Gestures
- **React Native Reanimated** - Powerful animations and interactions.
- **React Native Gesture Handler** - Declarative API exposing platform native touch and gesture system.

### Device Features
- **Expo Image Picker** - For selecting photos from the device library or taking new ones (used for catch uploads).

---

## ✨ Key Features

### Authentication System
- User registration and login flow.
- Role-based access control (Fisherman vs. Buyer).

### 🎣 Fisherman App (`/app/(fisherman)`)
- **Fisherman Dashboard**: Overview of recent sales, active listings, and quick stats.
- **Add Catch**: Interface to upload photos, set prices, and list new catches using device camera/gallery.
- **My Listings**: Manage active and past seafood listings.
- **Order Management**: Accept, process, and update the status of incoming orders.
- **Earnings Tracking**: View income and sales history.
- **Profile Management**: Update fisherman details and settings.

### 🛒 Buyer App (`/app/(buyer)`)
- **Buyer Dashboard**: Discover fresh catches and featured seafood.
- **Browse & Search**: Filter and search through available listings from local fishermen.
- **Listing Details**: Detailed view of the seafood, including price, weight, and fisherman info.
- **Checkout Process**: Secure and straightforward ordering system.
- **Order Tracking**: Real-time tracking of current orders.
- **Order History**: Review past purchases.
- **Profile Management**: Update personal and delivery information.

### 💬 Shared Features
- **Order Chat**: In-app messaging system for buyers and fishermen to communicate regarding orders.
- **Notifications**: Alerts for order updates, new messages, and other important events.
- **State Persistence**: User sessions and preferences are saved locally.

---

## 📂 Project Structure

```
isdahub-1.1/
├── app/                  # Expo Router file-based routes
│   ├── (auth)/           # Authentication flows (Login/Register)
│   ├── (buyer)/          # Buyer specific screens
│   ├── (fisherman)/      # Fisherman specific screens
│   ├── notifications.tsx # Global notifications screen
│   ├── order-chat.tsx    # Global messaging screen
│   └── splash.tsx        # App splash screen
├── assets/               # Images, icons, and static assets
├── components/           # Reusable UI components
│   └── ui/               # Core UI elements (Button, Card, Input, etc.)
├── constants/            # Global constants (Colors, Types, Locations)
├── store/                # Zustand state management stores
└── types/                # TypeScript type definitions
```

## 🛠️ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on devices:**
   - Press `a` for Android emulator.
   - Press `i` for iOS simulator.
   - Scan the QR code using the Expo Go app on your physical device.
