import { Inertia } from '@inertiajs/inertia'

export default {
  created() {
    if (!this.$options.remember) {
      return
    }

    if (Array.isArray(this.$options.remember)) {
      this.$options.remember = { data: this.$options.remember }
    }

    if (typeof this.$options.remember === 'string') {
      this.$options.remember = { data: [this.$options.remember] }
    }

    if (typeof this.$options.remember.data === 'string') {
      this.$options.remember = { data: [this.$options.remember.data] }
    }

    const rememberKey = this.$options.remember.key instanceof Function
      ? this.$options.remember.key.call(this)
      : this.$options.remember.key

    const restored = Inertia.restore(rememberKey)

    const rememberable = this.$options.remember.data.filter(key => {
      return !(typeof this[key] === 'object' && this[key] !== null && this[key].__rememberable === false)
    })

    rememberable.forEach(key => {
      const hasCallacks = typeof this[key].__remember === 'function' && typeof this[key].__restore === 'function'

      if (this[key] !== undefined && restored !== undefined && restored[key] !== undefined) {
        hasCallacks ? this[key].__restore(restored[key]) : (this[key] = restored[key])
      }

      this.$watch(key, () => {
        Inertia.remember(
          rememberable.reduce((data, key) => ({
            ...data,
            [key]: hasCallacks ? this[key].__remember(): this[key],
          }), {}),
          rememberKey,
        )
      }, { immediate: true, deep: true })
    })
  },
}
