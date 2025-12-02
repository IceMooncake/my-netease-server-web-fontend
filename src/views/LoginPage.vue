<template>
  <div class="page">
    <img src="./assets/login-background.png" alt="模糊背景" class="bg-blur" />
    <div class="icon">
      <img src="./assets/icon.png" alt="主背景" />
    </div>
    <div class="form-wrapper">
      <h2 class="title">{{ mode === 'login' ? '登录' : '注册' }}</h2>
      <form @submit.prevent="onSubmit">
        <div class="form-item">
          <label for="username">QQ</label>
          <input
            id="username"
            v-model="form.username"
            name="username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-item">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div style="margin: 16px 0">
          <button type="submit">
            {{ mode === 'login' ? '登录' : '注册' }}
          </button>
        </div>
      </form>
      <div class="toggle" @click="toggleMode">
        {{ mode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const mode = ref('login')
const form = reactive({
  username: '',
  password: '',
})

function onSubmit() {
  alert(`${mode.value}成功！用户名：${form.username}`)
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}
</script>

<style scoped>
.page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.icon {
  text-align: center;
  padding-top: 50px;
}
/* 模糊背景 */
.bg-blur {
  position: absolute;
  inset: 0;
  width: 100%;
  object-fit: cover;
  object-position: center;
  filter: blur(2px);
  z-index: -1;
}
/* 居中表单容器 */
.form-wrapper {
  position: absolute; /* 或 fixed，取决于是否要随滚动条移动 */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /* 水平 + 垂直 居中 */
  max-width: 360px;
  padding: 32px 24px;
  background: rgba(49, 167, 221, 0.5);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}

/* 标题 */
.title {
  text-align: center;
  margin-bottom: 24px;
  font-weight: 600;
  font-size: 1.6rem;
  color: #333;
}

/* 模式切换 */
.toggle {
  text-align: center;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem;
  margin-top: 8px;
}
</style>
