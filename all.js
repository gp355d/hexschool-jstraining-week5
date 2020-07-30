// 將 VeeValidate input 驗證工具載入 作為全域註冊
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
// 將 VeeValidate 完整表單 驗證工具載入 作為全域註冊
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
Vue.use(VueLoading);//以原型的方式使用元件
Vue.component('loading', VueLoading);//以元件的方式使用

//Class設定檔案
VeeValidate.configure({
    classes:{
        valid: 'is-valid',
        invalid: 'is-invalid'
    }
});
// money，千分號轉換說明
Vue.filter('money', function(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '$' + parts.join('.');
  });

new Vue({//定義資料
    el:'#app',
    data: {
        products:[],
        tmpProducts:{
            imageUrl:[],
        },
        status:{
            loadingItem: '',//按鈕讀取狀態
            isloadingupdateCart:''//購物車內增加或減少數量的按鈕讀取效果
            
        },
        payMoneyway:['WebATM','ATM','Barcode','Credit','ApplePay','GooglePay'],
        carts:[],
        cartTotal:0,
        isLoading:false,
        apiinfo:{
            uuid:'d52eae5f-b113-4dd1-81cc-46bd383ac57a',
            apipath:'https://course-ec-api.hexschool.io/api/',
        },
        text: '',
        email: '',
        phonenumber: '',
        address: '',
        pay: '',
        message: '',
    },
    methods:{
        submitForm:function(){
            alert('表單送出囉');
        },
        getProducts: function(page=1){
            //當傳入參數為空時，預設值設為為1
            this.isLoading = true;//讀取效果設為true，即打開效果
            const vm = this;
            //前台取得資料的API
            const api = ` ${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/products?page=${page}`;
            axios.get(api).then(function(res){
                console.log(res);
                vm.products = res.data.data;//將回傳的資料存入預先定義好的products陣列
                vm.isLoading = false;//讀取效果設為false，即關閉效果
            })
            .catch(function(error){
                vm.isLoading = false;
                console.log(error);
            })
            
        },
        getPeoductDetail:function(id){ //傳入選取的產品id

            const vm = this;
            this.status.loadingItem = id ;//status.loadingItem，，辨識是否開啟讀取效果，需搭配v-if語法來顯示
            //前台取得單一產品詳細資料的API
            const api = `${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/product/${id}`;
            // console.log(this.status);
            axios.get(api).then(function(res){
                // console.log(res);
                vm.status.loadingItem = '';
                vm.isLoading = false;
                vm.tmpProducts = res.data.data;//將回傳的資料存入預先定義好的tmpProducts
                console.log(vm.tmpProducts)
                vm.$set(vm.tmpProducts, 'num', 1);//?
                //    vm.tmpProducts.num = 1;
                $('#productModal').modal('show');
            })
            .catch(function(error){
                vm.isLoading = false;
                console.log(error);
            })
            
        },
        addToCart:function(id, quantity=1){//傳入選取的產品id，quantity預設值為1
            const vm = this;
            this.status.loadingItem = id;//status.loadingItem，，辨識是否開啟讀取效果，需搭配v-if語法來顯示
            this.isLoading = true;//讀取效果設為true，即打開效果
            //前台加入購物車的API
            const api = `${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/shopping`;
            const carts = {
                product: id,
                quantity:quantity,
            }
            console.log(carts);
            axios.post(api,carts).then(function(res){
                vm.getCart();//加入購物車後，重新讀取購物車列表
                vm.isLoading = false;//讀取效果設為false，即關閉效果
                $('#productModal').modal('hide');
                vm.status.loadingItem = '';
                console.log(res);
            })
            .catch(function(error){
                // console.log();
                alert(error.response.data.errors);
                vm.isLoading = false;
                vm.status.loadingItem =''
                $('#productModal').modal('hide');
            })
            
            // console.log(carts);
        },
        getCart:function(){
            const vm = this;
            this.isLoading = true;//讀取效果設為true，即打開效果
            // api/{uuid}/ec/shopping
            //取得購物車的API
            const api = `${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/shopping`;
            axios.get(api).then(function(res){
                console.log(res)
                vm.isLoading = false;
                vm.carts = res.data.data;
                vm.updateTotall();//取得購物車後，再更新購物車商品總價
                // console.log(res);
            })
            .catch(function(error){
                console.log(error.response);
                vm.isLoading = false;
            })
        },
        updateTotall:function(){
            const vm = this;
            vm.cartTotal = 0;
            //將carts的陣列依序跑迴圈
            vm.carts.forEach(function(item){
                //購物車商品售價壘加
                vm.cartTotal += item.product.price * item.quantity;
                console.log(vm.cartTotal, item.product.price, item.quantity)
            });
        },
        updateQuanity:function(id, quantity){//傳入選取的產品id，quantity為商品數量
            const vm = this;
            this.status.isloadingupdateCart = id;
            // this.isLoading = true;
            //更新產品數量API
            const api = `${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/shopping`;
            const carts = {
                product: id,
                quantity:quantity,
            }
            console.log(carts);
            axios.patch(api,carts).then(function(res){
                vm.getCart();//更新購物車內的數量後，再取得購物車列表
                // vm.isLoading = false;
                vm.status.isloadingupdateCart = '';
                console.log(res);
            })
            .catch(function(error){
                console.log(error.response);
                vm.isLoading = false;
            })
        },
        removeAllCartItem:function() {
            const vm = this;
            this.isLoading = true;//讀取效果設為true，即打開效果
            //移除購物車內所有資料的API
            const api = `${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/shopping/all/product`;
      
            axios.delete(api).then(function(){
                vm.isLoading = false;//讀取效果設為true，即關閉效果
                vm.getCart();//移除購物車內所有資料，再取得取得購物車列表
              })
            .catch(function(error){
                console.log(error.response);
                vm.isLoading = false;
            })
          },
          removeCartItem:function(id) {//傳入選取的產品id
            const vm = this;
            this.isLoading = true;
            //移除購物車內單筆資料的API
            const api = `${this.apiinfo.apipath}${this.apiinfo.uuid}/ec/shopping/${id}`;
      
            axios.delete(api).then(function(){
              vm.isLoading = false;//讀取效果設為true，即關閉效果
              vm.getCart();//移除購物車內單筆資料，再取得取得購物車列表
            })
            .catch(function(error){
                console.log(error.response);
                vm.isLoading = false;
            })
          },
    },
    created(){
        //網頁預設執行
        this.getProducts();
        // this.removeAllCartItem();
        this.getCart();
        // this. getPeoductDetail();
    }

})
