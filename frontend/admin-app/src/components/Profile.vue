<template>
  <div>
    <el-dialog
      title='个人资料' @close="handleCancel"
      :visible.sync="visible" :dialogVisible="dialogVisible"
      width="720px">
      <el-row type="flex" justify="center">
        <el-col :span="20">
          <el-form label-position="right" label-width="140px"
            :model="form" :rules="rules" ref="form">
            <el-form-item label="学号">
              <el-input v-model="form.id" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="form.name" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone"></el-input>
            </el-form-item>
            <el-form-item label="学院">
              <el-input v-model="form.school" :disabled="true"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="submit(form.id)">确 定</el-button>
      </span>
  </el-dialog>
  </div>
</template>

<script>
import { instance } from '@/helpers/instances';

export default {
  name: 'Profile',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    const validatePhone = (rule, value, callback) => {
      const reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (value === '' || value === undefined || value === null) {
        callback();
      } else if ((!reg.test(value)) && value !== '') {
        console.log('invalid phone!');
        callback(new Error('请输入正确的电话号码'));
      } else {
        callback();
      }
    };
    return {
      visible: false,
      form: {
        id: '',
        name: '',
        nickname: '',
        email: '',
        phone: '',
        school: '',
      },
      rules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: ['change', 'blur'] },
        ],
        email: [
          {
            type: 'email', required: true, message: '请输入正确的邮箱', trigger: ['change', 'blur'],
          },
        ],
        phone: [
          { validator: validatePhone, message: '请输入正确的联系电话', trigger: ['change', 'blur'] },
        ],
      },
    };
  },
  watch: {
    dialogVisible() {
      this.visible = this.dialogVisible;
      if (this.visible) {
        console.log(this.id);
        this.form.id = this.id;
        this.axios.get(`/api/v1/users/${this.id}`, {
          headers: {
            Authorization: `Bearer ${this.$store.state.token}`,
          },
        }).then((res) => {
          console.log(res);
          if (res.status === 200) {
            this.form.name = res.data.name;
            this.form.nickname = res.data.nickname;
            this.form.email = res.data.email;
            this.form.phone = res.data.phone;
          }
        }).catch((err) => {
          if (err.response.status === 403
            && err.response.data.msg === 'Token expired') {
            this.$message.error('登录已失效，请重新登录！');
            this.$store.commit('setProansToken', '');
            const currentUrl = window.location.href;
            const appname = currentUrl.slice(0, currentUrl.indexOf('#'));
            const hashparam = currentUrl.slice(currentUrl.indexOf('#') + 1);
            const serviceUrl = `${appname}?hashparam=${hashparam}`;
            window.location.href = `http://passport.ustc.edu.cn/logout?service=${encodeURIComponent(serviceUrl)}`;
          }
        });
      }
    },
  },
  methods: {
    handleCancel() {
      this.$emit('update:dialogVisible', false);
    },
    submit(id) {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.error('请正确填写完表格再提交！');
          return;
        }
        instance.put(`/api/v1/users/${id}`, {
          id: this.form.id,
          name: this.form.name,
          nickname: this.form.nickname,
          email: this.form.email,
          phone: this.form.phone,
          school: this.form.school,
        }, {
          headers: {
            Authorization: `Bearer ${this.$store.state.token}`,
          },
        }).then((res) => {
          console.log(res);
        });
        console.log(id);
        this.$emit('update:dialogVisible', false);
      });
    },
  },
};
</script>
