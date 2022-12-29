

function addToCart(proId){
   
    $.ajax({
        
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
              let count=$('#cart-count').html()
              count=parseInt(count)+1
              $("#cart-count").html(count)
            }
            
    swal("product added to cart", "", "success");
        }
    })
}

function addToWish(proId){
   console.log('hi ajax wish');
    $.ajax({
        
        url:'/add-to-wish/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
              let count=$('#wish-count').html()
              count=parseInt(count)+1
              $("#wish-count").html(count)
            }
            
    swal("product added to wishlist", "", "success");
        }
    })
}
function deleteFromWish(cartId, proId) {
    $.ajax({
        url: '/deleteFromWish',
        data: {
            cart: cartId,
            product: proId
        },
        method: 'post',
        success: (response) => {

            alert("Product Removed ")

            location.reload()

        }
    })
}