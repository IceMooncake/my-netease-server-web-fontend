<template>
  <!-- 模糊背景 -->
  <img
    src="@/assets/login-background.png"
    alt="模糊背景"
    class="absolute inset-0 w-full h-full object-cover filter blur-xs brightness-75 -z-10"
  />

  <div class="relative h-screen overflow-hidden font-sans mx-4">
    <!-- 图标 -->
    <div class="text-center pt-12">
      <img src="@/assets/icon.png" alt="主背景" class="mx-auto" />
    </div>

    <!-- 表单容器 -->
    <div
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-xs w-full p-3 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30"
    >
      <h2 class="text-center text-white text-2xl font-bold mb-7 drop-shadow-lg">
        {{ mode === 'login' ? '登录' : '注册' }}
      </h2>

      <form @submit.prevent="onSubmit">
        <!-- 用户名 -->
        <div class="flex flex-col mb-5">
          <label for="username" class="mb-1 text-white font-medium drop-shadow">QQ</label>
          <input
            id="username"
            v-model="form.username"
            name="username"
            type="text"
            placeholder="群内个人QQ号"
            required
            class="px-4 py-2 rounded-xl border border-white/40 bg-white/25 text-white placeholder-white/70 text-sm focus:border-blue-400 focus:bg-white/35 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <!-- 密码 -->
        <div class="flex flex-col mb-5">
          <label for="password" class="mb-1 text-white font-medium drop-shadow">密码</label>
          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            placeholder="注册密码 非QQ密码！！！"
            required
            class="px-4 py-2 rounded-xl border border-white/40 bg-white/25 text-white placeholder-white/70 text-sm focus:border-blue-400 focus:bg-white/35 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <!-- 确认密码（仅注册时显示） -->
        <div v-if="mode === 'register'" class="flex flex-col mb-5">
          <label for="confirmPassword" class="mb-1 text-white font-medium drop-shadow"
            >确认密码</label
          >
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="请再次输入"
            required
            class="px-4 py-2 rounded-xl border border-white/40 bg-white/25 text-white placeholder-white/70 text-sm focus:border-blue-400 focus:bg-white/35 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <!-- 提交按钮 -->
        <div class="mb-4">
          <button
            type="submit"
            class="w-full py-3 rounded-3xl bg-gradient-to-r from-blue-500 to-sky-400 text-white text-base font-semibold shadow-lg hover:from-sky-400 hover:to-blue-500 transition"
          >
            {{ mode === 'login' ? '登录' : '注册' }}
          </button>
        </div>
      </form>

      <!-- 模式切换 -->
      <div
        @click="toggleMode"
        class="text-center text-white text-sm mt-3 underline cursor-pointer drop-shadow hover:text-yellow-400 transition"
      >
        {{ mode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { ref, reactive } from 'vue'

const mode = ref('login')
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}

function onSubmit() {
  alert(`${mode.value}成功！用户名：${form.username}`)
  // router.push('/home')
}

</script>
