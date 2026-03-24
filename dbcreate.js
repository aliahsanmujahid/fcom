const db = require("../config/db");

exports.createuser = async (req, res) => {
 const sql = `CREATE TABLE users (
         id INT AUTO_INCREMENT PRIMARY KEY,
         uid VARCHAR(255),
         name VARCHAR(255),
         phone VARCHAR(255),
         image VARCHAR(255),
         role VARCHAR(255),
         gender VARCHAR(255),
         bodytype VARCHAR(255),
         dob VARCHAR(255),
         status int,
         cdate DATETIME DEFAULT CURRENT_TIMESTAMP,
         adate DATETIME DEFAULT CURRENT_TIMESTAMP);`;
       db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("user table creatd");
        res.send('user table creatd');
    });
};
exports.createaddress = async (req, res) => {
 const sql = `CREATE TABLE address (
         id INT AUTO_INCREMENT PRIMARY KEY,
         uid VARCHAR(255),
         name VARCHAR(255),
         phone VARCHAR(255),
         region VARCHAR(255),
         city VARCHAR(255),
         address VARCHAR(500));`;
       db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("user table creatd");
        res.send('user table creatd');
    });
};
exports.visitors = async (req, res) => {
    const sql = `CREATE TABLE visitors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            visitorid VARCHAR(300),
            cdate DATETIME DEFAULT CURRENT_TIMESTAMP,
            adate DATETIME DEFAULT CURRENT_TIMESTAMP
           );`;
          db.query(sql, (err, result) => {
           if(err) throw err;
           console.log("visitors table creatd");
           res.send('visitors table creatd');
       });
   };

exports.product = async (req, res) => {
    const sql = `CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        avgrating float DEFAULT 0, 
        treview int DEFAULT 0,
        tfav int DEFAULT 0,
        tquestion int DEFAULT 0,
        cateid int, catename VARCHAR(255) DEFAULT '',
        subcateid int,subcatename VARCHAR(255) DEFAULT '',
        name VARCHAR(1000) DEFAULT '',details VARCHAR(10000) DEFAULT '',
        ia int DEFAULT 0,sku VARCHAR(255) DEFAULT '',
        price int DEFAULT 0,sprice int DEFAULT 0,
        quantity int DEFAULT 0,
        weight float DEFAULT 0,
        file1 VARCHAR(255),file2 VARCHAR(255),file3 VARCHAR(255),file4 VARCHAR(255),
        hasvari int DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP);`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("product table creatd");
        res.send('product table creatd');
    });
};

exports.orders = async (req, res) => {
    const sql = `CREATE TABLE orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid VARCHAR(255),
            name VARCHAR(255),
            phone VARCHAR(255),
            region VARCHAR(255),
            city VARCHAR(255),
            zone VARCHAR(255),
            address VARCHAR(1000),
            delivery int,
            ctitle VARCHAR(255),
            cvalue int,
            subtotal int,
            total int,
            status VARCHAR(255) DEFAULT 'pending',
            customerid int,
            customeruid VARCHAR(255),
            ispaid int DEFAULT 0,
            txn VARCHAR(255),
            txnc int DEFAULT 0,
            reason VARCHAR(1000),
            qtyreduced int DEFAULT 0,
            pdate DATETIME DEFAULT null,
            date DATETIME DEFAULT CURRENT_TIMESTAMP);`;
          db.query(sql, (err, result) => {
           if(err) throw err;
           console.log("Order table creatd");
           res.send('Order table creatd');
       });
};
exports.orderitems = async (req, res) => {
    let sql = 
       `CREATE TABLE orderitems(id int AUTO_INCREMENT, 
       pid int, puid VARCHAR(255), orderid int,isr int,
       returned int DEFAULT 0,returntxt VARCHAR(1000),
       name VARCHAR(1000),img VARCHAR(255),price int,sprice int,
       quantity int,totalprice int,
       sku VARCHAR(255),vari VARCHAR(255),vname VARCHAR(255),vsku VARCHAR(255),
       qtyreduced int,PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("orderitems table creatd");
        res.send('orderitems table creatd');
    });
};

exports.otpcheck = async (req, res) => {
    let sql = `CREATE TABLE otpcheck(id int AUTO_INCREMENT,phone VARCHAR(255),
       otp int,date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("otpcheck table creatd");
        res.send('otpcheck table creatd');
    });
};

exports.cate = async (req, res) => {
    let sql = `CREATE TABLE cate(id int AUTO_INCREMENT, image VARCHAR(255),
    name VARCHAR(255),PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("otpcheck table creatd");
        res.send('otpcheck table creatd');
    });
};
exports.subcate = async (req, res) => {
    let sql = `CREATE TABLE subcate(id int AUTO_INCREMENT,
    cateid int,image VARCHAR(255),
    name VARCHAR(255),PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("otpcheck table creatd");
        res.send('otpcheck table creatd');
    });
};

exports.reviews = async (req, res) => {
    const sql = `CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        oitemid int,pid int,puid VARCHAR(1000),
        customerid int,customeruid VARCHAR(1000),
        rby VARCHAR(1000),rbyn VARCHAR(1000),
        status VARCHAR(255),
        rating int, answer VARCHAR(1000),review VARCHAR(1000),
        image1 VARCHAR(1000),image2 VARCHAR(1000),
        image3 VARCHAR(1000),  
        ansdate DATETIME DEFAULT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP);`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("otpcheck table creatd");
        res.send('otpcheck table creatd');
    });
};

exports.vari = async (req, res) => {
    let sql = `CREATE TABLE vari(id int AUTO_INCREMENT,
     pid int,name VARCHAR(255), PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("vari1 table creatd");
        res.send('vari1 table creatd');
    });
};

exports.varivalues = async (req, res) => {
    let sql = 
        `CREATE TABLE varivalues(id int AUTO_INCREMENT, 
        variid int, pid int,vname VARCHAR(255),name VARCHAR(255), 
        price int, sprice int, quantity int,
        sku VARCHAR(255), PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("varivalues table creatd");
        res.send('varivalues table creatd');
    });
};

exports.sitemanage = async (req, res) => {
    const sql = `CREATE TABLE sitemanage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        smskey VARCHAR(1000),paymenttype int,
        steadfast VARCHAR(1000),
        paymentinfo VARCHAR(1000),masterkey VARCHAR(1000));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("terms table creatd");
        res.send('terms table creatd');
    });
};

exports.sitecontent = async (req, res) => {
    let sql = 
       `CREATE TABLE sitecontent(
        id INT AUTO_INCREMENT PRIMARY KEY,
        scripts VARCHAR(1000) DEFAULT '',
        facebook VARCHAR(1000) DEFAULT '',
        tiktok VARCHAR(1000) DEFAULT '',
        instagram VARCHAR(1000) DEFAULT '',
        youtube VARCHAR(1000) DEFAULT '',
        logo VARCHAR(1000) DEFAULT '',
        favicon VARCHAR(1000) DEFAULT '');`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("footer table creatd");
        res.send('footer table creatd');
    });
};
exports.delivery = async (req, res) => {
    let sql = 
       `CREATE TABLE delivery(id int AUTO_INCREMENT,
        inside_city_charge int,
        outside_city_charge int, 
        extra_per_kg int,
        PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("terms table creatd");
        res.send('terms table creatd');
    });
};
exports.coupons = async (req, res) => {
    let sql = `CREATE TABLE coupons(id INT AUTO_INCREMENT PRIMARY KEY,
     phone VARCHAR(255), posted int DEFAULT 0,code VARCHAR(255), 
     value int,minp int, minc int,ulimit int DEFAULT NULL,
     time DATETIME DEFAULT NULL);`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("varivalues table creatd");
        res.send('varivalues table creatd');
    });
};

exports.fav = async (req, res) => {
    let sql = 
       `CREATE TABLE fav(id int AUTO_INCREMENT,uid int,
       pid int, PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("terms table creatd");
        res.send('terms table creatd');
    });
};
exports.pages = async (req, res) => {
    let sql = `CREATE TABLE pages(id int AUTO_INCREMENT,
    name VARCHAR(500),
    c VARCHAR(10000),ismain int,PRIMARY KEY(id));`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("product table creatd");
        res.send('product table creatd');
    });
};
exports.files = async (req, res) => {
    const sql = `CREATE TABLE files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            img VARCHAR(500),orderimg VARCHAR(500),userid int,type int);`;
          db.query(sql, (err, result) => {
           if(err) throw err;
           console.log("files table creatd");
           res.send('files table creatd');
       });
};
exports.questions = async (req, res) => {
    const sql = `CREATE TABLE questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question VARCHAR(1000) DEFAULT '',
            answer VARCHAR(1000) DEFAULT '',
            pid int,
            puid VARCHAR(255),
            customerid int,
            customeruid VARCHAR(255),
            customername VARCHAR(1000) DEFAULT '',
            adate DATETIME DEFAULT NULL,
            cdate DATETIME DEFAULT CURRENT_TIMESTAMP
            );`;
          db.query(sql, (err, result) => {
           if(err) throw err;
           console.log("files table creatd");
           res.send('files table creatd');
       });
};

exports.views = async (req, res) => {
    const sql = `CREATE TABLE views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pid VARCHAR(255),
    uid VARCHAR(255),
    visitorid VARCHAR(300),
    date DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("views table creatd");
        res.send('views table creatd');
    });
}

exports.cart = async (req, res) => {
    const sql = `CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(255),
    visitorid VARCHAR(300),
    items VARCHAR(10000),
    date DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("views table creatd");
        res.send('views table creatd');
    });
}

exports.cron = async (req, res) => {
    const sql = `CREATE TABLE cron (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visited int 
    );`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("views table creatd");
        res.send('views table creatd');
    });
}







