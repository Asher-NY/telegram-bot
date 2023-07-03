// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, remove, onValue, orderByChild, equalTo, query, orderByKey, DatabaseReference } from 'firebase/database';
import { User, getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default class FireBase {
    static app: FirebaseApp;

    /**用户表引用 */
    static usersRef: DatabaseReference;
    static user: User;

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
            this.user = userCredential.user;
            console.log("登录成功");

            this.initDatabase();

        } catch (error: any) {
            // 登录失败
            console.log("登录失败", error);
        }
    };

    static async initDatabase() {
        const database = getDatabase(this.app);

        // 创建数据
        this.usersRef = ref(database, 'users');
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
        // onValue(usersRef, (snapshot) => {
        //     const users = snapshot.val();
        //     // console.log("users", users);

        //     // 遍历每一条数据
        //     for (const data in users) {
        //         const userData = users[data];
        //         if (userData) {
        //             console.log("监听数据的变化", userData);
        //         }
        //     }
        // }, {
        //     // 可选参数，用于取消监听
        //     onlyOnce: false
        // });


        // this.updateBalance("gv2Glnp82pVQx0qy3mdG8RueCn92", 99999);
        // let a = await this.queryBalance("gv2Glnp82pVQx0qy3mdG8RueCn92");
        // console.log(a);

    }

    /**更新用户余额 */
    static async updateBalance(uid: string, balance: number): Promise<any> {

        return new Promise<number>((resolve, reject) => {
            // 创建查询
            const queryRef = query(this.usersRef, orderByKey(), equalTo(uid));

            // 执行查询
            onValue(queryRef, (snapshot) => {

                let updatedData = snapshot.val();
                console.log("准备修改数据：", uid, balance, updatedData);
                if (!updatedData) {
                    updatedData = {};
                    updatedData[uid] = {
                        balance: balance
                    };
                }
                else {
                    updatedData[uid].balance = balance;
                }

                // 更新数据
                update(this.usersRef, updatedData)
                    .then(() => {
                        console.log("数据更新成功", updatedData);
                        return resolve(updatedData);
                    })
                    .catch((error) => {
                        console.log("数据更新失败", error);
                        return reject(error);
                    });
            }, (error) => {
                console.log("onValue err:", error);
                return reject(error);
            }, { onlyOnce: true });
        });

    }

    static async queryBalance(uid: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const queryRef = query(this.usersRef, orderByKey(), equalTo(uid));

            onValue(queryRef, (snapshot) => {
                let updatedData = snapshot.val();
                if (updatedData) {
                    // console.log(updatedData[uid]);

                    return resolve(updatedData[uid].balance);
                } else {
                    return resolve(0);
                }
            }, (err) => {
                return resolve(0);
            }, { onlyOnce: true });
        });
    }


}

