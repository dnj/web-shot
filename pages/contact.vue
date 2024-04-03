<template>
    <v-container class="pb-15">
        <v-row class="contact">
            <v-col md="6" cols="12" order="last" order-md="first">
                <div>
                    <div class="title">ارتباط با ما</div>
                    اگر سوال و یا نظری دارید میتوانید با ایمیل support@web-shot.ir در ارتباط باشد.<br />
                    به فاصله ی یک روز کاری پاسختان را خواهیم داد.
                </div>
                <div>
                    <div class="title mt-7">راه های ارتباطی</div>
                    <v-row cols="6" dir="rtl">
                        <v-col cols="4">
                            <div class="font-weight-bold">ایمیل:</div>
                        </v-col>
                        <v-col cols="8">
                            <div>support@web-shot.ir</div>
                        </v-col>
                    </v-row>
                    <v-row cols="12" dir="rtl">
                        <v-col cols="4">
                            <div class="font-weight-bold">تلفن:</div>
                        </v-col>
                        <v-col cols="8">
                            <div>031-34420301</div>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
            <v-col md="6" cols="12">
                <v-img class="mx-auto" src="./../styles/pics/contactus.svg" height="300px"></v-img>
            </v-col>
        </v-row>
    </v-container>
</template>
<style lang="scss">
.contact {
    margin-top: 30px;
    margin-bottom: 30px;
    text-align: start;
    color: rgb(var(--v-theme-contentGray));
    line-height: 40px;

    .title {
        color: rgb(var(--v-theme-titleGray));
        font-weight: 900;
        font-size: 19px;
    }
}
</style>