// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyB89QrgTii99AB0Z7aJcg4l0phJOjvurw0",
    authDomain: "aaaa-becaa.firebaseapp.com",
    projectId: "aaaa-becaa",
    storageBucket: "aaaa-becaa.firebasestorage.app",
    messagingSenderId: "662271665854",
    appId: "1:662271665854:web:13e95c308af4495b4fe0ef",
    measurementId: "G-6JNGDZ4XP4"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 데이터베이스 참조
const db = firebase.firestore(); 