<template>
  <el-row>
    <div class="comment-title">{{ com.title }}</div>
    <div class="comment-body">
      <render :markdown="com.content"/>
    </div>
    <div class="comment-footer">
      <div class="edit-info">
        <span>{{ com.author.nickname }} 发起的讨论</span>
      </div>
      <div class="buttons">
        <el-button type="primary" size="small"
          :disabled="disableInteract"
          @click="showEditor('edit')" icon="el-icon-edit" plain>编辑</el-button>
        <el-button type="primary" icon="el-icon-chat-dot-round" size="small"
          :disabled="disableInteract"
          @click="showEditor('reply')" plain>回复</el-button>
        <el-button type="danger" size="small"
          :disabled="disableInteract"
          @click="handleDelete" icon="el-icon-delete" plain>删除</el-button>
      </div>
    </div>
    <el-row class="editor" v-show="isEditorShow">
      <el-input v-model="form.title"
        placeholder="标题" v-show="form.type === 'edit'"></el-input>
      <editor v-model="form.content"></editor>
      <div class="buttons">
        <el-button type="primary" icon="el-icon-close" size="small"
          @click="isEditorShow = false" plain>取消</el-button>
        <el-button type="primary" icon="el-icon-position" size="small"
          @click="submitForm" plain>确定</el-button>
      </div>
    </el-row>
    <el-collapse accordion v-model="isShow">
      <el-collapse-item name="comment">
        <template slot="title">
          <i class="header-icon el-icon-chat-dot-round"></i>
          <span class="reply-header">查看回复</span>
        </template>
        <div v-for="(rep, index) in replyList" :key="index">
          <card-reply class="reply"
            :reply="rep">
          </card-reply>
        </div>
        <div v-if="replyList.length == 0">暂时没有回复噢</div>
      </el-collapse-item>
    </el-collapse>
  </el-row>
</template>

<script>
import CardReply from '@/components/Discussion/CardReply.vue';
import Render from '../Render.vue';
import Editor from '../Editor.vue';
import { instance } from '../../helpers/instances';

export default {
  name: 'CardComment',
  components: {
    CardReply,
    Render,
    Editor,
  },
  props: {
    com: Object,
    disableInteract: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    isShow(newVal) {
      if (newVal === 'comment') {
        this.updateData();
      }
    },
  },
  data() {
    return {
      replyEditorShow: false,
      editEditorShow: false,
      isShow: '',
      replyList: [
        {
          title: '1',
          content: 'askdjfhas',
          author_gid: '1',
          reply_id: '0',
        },
      ],
      form: {
        title: '',
        content: '',
        type: '',
      },
      isEditorShow: false,
    };
  },
  methods: {
    showEditor(type) {
      this.form = {
        type,
        title: type === 'edit' ? this.com.title : '',
        content: type === 'edit' ? this.com.content : '',
      };
      this.isEditorShow = true;
    },
    submitForm() {
      if (this.form.type === 'edit') {
        this.handleEdit();
      } else {
        this.handleReply();
      }
      this.isEditorShow = false;
    },
    handleEdit() {
      instance.put(`/api/v1/discussions/${this.com.id}`, this.form)
        .then(() => {
          this.com.title = this.form.title;
          this.com.content = this.form.content;
        });
    },
    handleReply() {
      instance.post(`/api/v1/discussions/${this.com.id}/answer`, { content: this.form.content })
        .then((res) => {
          console.log(res);
          this.replyList.push({
            author_gid: '0000000',
            content: this.form.content,
          });
          this.updateData();
        });
    },
    handleDelete() {
      instance.delete(`/api/v1/discussions/${this.com.id}`)
        .then((res) => {
          console.log(res);
          this.$emit('deleteDiscussion', this.com.id);
        });
    },
    updateData() {
      this.axios.get(`/api/v1/discussions/${this.com.id}/answer`, {
        headers: {
          Authorization: `Bearer ${this.$store.state.proansToken}`,
        },
      }).then((res) => {
        console.log(res);
        if (res.status !== 200) {
          console.log(JSON.stringify(res.data));
          return;
        }
        this.replyList = res.data;
        console.log(this.replyList);
      });
    },
  },
  computed: {
    userAndTime() {
      return `${this.username}@${this.time}：`;
    },
  },
  beforeMount() {
    // this.updateData();
  },
};
</script>

<style scoped>
.comment {
  margin-bottom: 15px;
}

.comment-footer {
  height: 30px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-title {
  line-height: 30px;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
}

.edit-info {
  margin-top: 20px;
  font-size: 12px;
  color: #606266;
}

.editor {
  margin-top: 10px;
}

.reply {
  margin-bottom: 10px;
}

.reply-header {
  font-size: 14px;
}

.el-button {
  margin-left: 5px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
