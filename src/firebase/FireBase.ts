// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, push, child, update, remove, onValue, orderByChild, equalTo, query, startAt } from 'firebase/database';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default class FireBase {
    static app: FirebaseApp;

    static init() {
        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_apiKey,
            authDomain: process.env.FIREBASE_authDomain,
            projectId: process.env.FIREBASE_projectId,
            storageBucket: process.env.FIREBASE_storageBucket,
            messagingSenderId: process.env.FIREBASE_messagingSenderId,
            appId: process.env.FIREBASE_appId,
            measurementId: process.env.FIREBASE_measurementId,
        };

        console.log("firebase config=", firebaseConfig);


        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);

        this.login("ashernanyang@gmail.com", "asher.com")

    }

    static async login(email: string, password: string) {

        // 获取身份验证实例
        const auth = getAuth(this.app);

        try {
            // 使用邮箱和密码进行登录
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // 登录成功
            const user = userCredential.user;
            console.log("登录成功",);
            this.initDatabase();

        } catch (error: any) {
            // 登录失败
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("登录失败", errorCode, errorMessage);
        }
    };

    static async initDatabase() {
        const database = getDatabase(this.app);
        // console.log(database);
        // 创建数据
        const usersRef = ref(database, 'users');
        // set(usersRef, {
        //     1: {
        //         name: 'John',
        //         id: 25,
        //     },
        //     2: {
        //         name: 'Jane',
        //         id: 30,
        //     },
        // });

        // 读取数据
        // get(usersRef).then((snapshot) => {
        //     if (snapshot.exists()) {
        //         const userData = snapshot.val();
        //         console.log("读取数据", userData);
        //     } else {
        //         console.log('Data not found');
        //     }
        // });

        // 监听数据的变化
        onValue(usersRef, (snapshot) => {
            const users = snapshot.val();
            // console.log("users", users);

            // 遍历每一条数据
            for (const data in users) {
                const userData = users[data];
                if (userData) {
                    console.log("监听数据的变化", userData);
                }
            }
        }, {
            // 可选参数，用于取消监听
            onlyOnce: false
        });

        setTimeout(() => {

            // 创建查询
            const queryRef = query(usersRef, equalTo("2"));
            // console.log("queryRef", queryRef);
            

            // 执行查询
            onValue(queryRef, (snapshot) => {
                console.log(snapshot.size);
                
                snapshot.forEach((childSnapshot) => {
                    console.log("childSnapshot=",childSnapshot);
                    
                    const userRef = ref(database, `users/${childSnapshot.key}`);

                    // const updatedData = {
                    //     // 要更新的字段和值
                    //     name: "New Name"
                    // };

                    // // 更新数据
                    // update(userRef, updatedData)
                    //     .then(() => {
                    //         console.log("数据更新成功");
                    //     })
                    //     .catch((error) => {
                    //         console.log("数据更新失败", error);
                    //     });
                });
            });
        }, 2000);
    }
}

