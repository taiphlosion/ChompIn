# Chomp-In: QR-Based Attendance Tracking System

Chomp-In is a mobile application designed to streamline attendance tracking in educational settings. The application allows professors to generate QR codes for their classes, which students can scan to mark their attendance in real-time.

## Features

- **User Authentication**: Secure login and registration system with role-based access (student/professor)
- **QR Code Generation**: Professors can generate unique QR codes for each class session
- **Attendance Scanning**: Students can scan QR codes to mark their attendance
- **Class Management**: Professors can create and manage multiple classrooms
- **Attendance History**: Track and view attendance records
- **Mobile-First Design**: Optimized for use on mobile devices

## Tech Stack

### Frontend
- React Native with Expo
- React Navigation for routing
- AsyncStorage for local data persistence

### Backend
- Node.js and Express
- PostgreSQL database
- JWT for authentication
- QR code generation and validation

## Project Structure

The project is organized into two main directories:

- `client/`: Contains the React Native mobile application
- `server/`: Contains the Express.js backend server

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL
- Docker (optional, for database setup)

### Backend Setup

1. Navigate to the server directory:
