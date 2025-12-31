const AsyncPatterns = {
    withCallback: (message, callback) => {
        console.log("1. Starting Callback...");
        setTimeout(() => {
            if (typeof callback === "function") callback(message);
        }, 1000);
    },

    withPromise: (message) => {
        console.log("2. Starting Promise...");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(message);
            }, 1000);
        });
    },

    runAsync: async (msg) => {
        console.log("3. Starting Async/Await...");
        try {
            const result = await AsyncPatterns.withPromise(msg);
            console.log("Async/Await Received:", result);
        } catch (error) {
            console.error("Error:", error);
        }
    }
};


AsyncPatterns.withCallback("Hello Callback", (res) => {
    console.log("Callback Received:", res);

    AsyncPatterns.withPromise("Hello Promise").then((res) => {
        console.log("Promise Resolved:", res);
        
        AsyncPatterns.runAsync("Hello Async/Await");
    });
});