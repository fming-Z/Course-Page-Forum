import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import VuexPersistence from 'vuex-persist';
import router from '../router';

Vue.use(Vuex);
const { Message } = require('element-ui');

export default new Vuex.Store({
  state: {
    problems: [],
    tags: [],
    count: 0,
    qid: 0,
    cid: 0,
    gid: '',
    proansToken: '',
    auth: '',
    commentList: [],
    courseInfo: {},
    lockTimer: 0,
  },
  getters: {
    commentList(state) {
      return state.commentList;
    },
    allProblems(state) {
      return state.problems;
    },
    allTags(state) {
      return state.tags;
    },
    problemsByLike(state) {
      return state.problems.filter((problem) => problem.liked === true);
    },
    problemsByTag(state) {
      return (tid) => {
        if (!tid) {
          return state.problems;
        }
        const problems = [];
        state.problems.forEach((p) => {
          p.tags.forEach((t) => {
            if (String(t.id) === String(tid)) {
              problems.push(p);
            }
          });
        });
        return problems;
      };
    },
    problemsBySearch(state, getters) {
      return (searchInfo, searchTag) => {
        const problems = [];
        if (searchTag === 'all') {
          state.problems.forEach((p) => {
            if (p.title.search(searchInfo) !== -1
            || p.content.search(searchInfo) !== -1) {
              problems.push(p);
            }
          });
        } else if (searchTag === '0') {
          getters.problemsByLike.forEach((p) => {
            if (p.title.search(searchInfo) !== -1
            || p.content.search(searchInfo) !== -1) {
              problems.push(p);
            }
          });
        } else {
          getters.problemsByTag(searchTag).forEach((p) => {
            if (p.title.search(searchInfo) !== -1
            || p.content.search(searchInfo) !== -1) {
              problems.push(p);
            }
          });
        }
        return problems;
      };
    },
    problem(state) {
      return (pid) => state.problems.find((p) => String(p.id) === String(pid));
    },
    tag(state) {
      return (tid) => state.tags.find((t) => String(t.id) === String(tid));
    },
  },
  mutations: {
    setGid(state, gid) {
      state.gid = gid;
    },
    setAuth(state, scope) {
      if (scope === 'StudentScope') {
        state.auth = '学生';
      } else if (scope === 'TeacherScope') {
        state.auth = '教师';
      } else if (scope === 'AdminScope') {
        state.auth = '管理员';
      } else if (scope === 'assistantScope') {
        state.auth = '助教';
      }
    },
    changeStudentAnswer(state, { content }) {
      const index = state.problems.findIndex((problem) => problem.id === state.qid);
      console.log('index:', index);
      console.log('change stu_ans: ', {
        ...state.problems[index],
        student_answer: {
          ...state.problems[index].student_answer,
          content,
        },
      });
      if (index >= 0 && index < state.problems.length) {
        state.problems.splice(index, 1, {
          ...state.problems[index],
          student_answer: {
            ...state.problems[index].student_answer,
            content,
          },
        });
      }
    },
    setCommentList(state, { list }) {
      state.commentList.splice(0, state.commentList.length);
      state.commentList.push(...list);
    },
    setQid(state, { id }) {
      state.qid = id;
    },
    setCid(state, { id }) {
      state.cid = id;
    },
    initProblems(state, problems) {
      state.problems.splice(0, state.problems.length);
      state.problems.push(...problems);
      const tags = [];
      state.problems.forEach((p) => {
        p.tags.forEach((t) => {
          if (tags.find((ta) => ta.name === t.name) === undefined) {
            tags.push(t);
          }
        });
      });
      state.tags.splice(0, state.tags.length);
      state.tags.push(...tags);
    },
    updateProblem(state, problem) {
      const i = state.problems.findIndex((p) => String(p.id) === String(problem.id));
      state.problems.splice(i, 1, problem);
      const tags = [];
      state.problems.forEach((p) => {
        p.tags.forEach((t) => {
          if (tags.find((ta) => ta.name === t.name) === undefined) {
            tags.push(t);
          }
        });
      });
      state.tags.splice(0, state.tags.length);
      state.tags.push(...tags);
    },
    deleteProblem(state, problem) {
      const i = state.problems.findIndex((p) => String(p.id) === String(problem.id));
      state.problems.splice(i, 1);
      const tags = [];
      state.problems.forEach((p) => {
        p.tags.forEach((t) => {
          if (tags.find((ta) => ta.name === t.name) === undefined) {
            tags.push(t);
          }
        });
      });
      state.tags.splice(0, state.tags.length);
      state.tags.push(...tags);
    },
    setProansToken(state, token) {
      state.proansToken = token;
    },
    getCourseInfo(state, data) {
      state.courseInfo = data;
    },
  },
  actions: {
    initProblems(context) {
      axios.get(`/api/v1/courses/${context.state.cid}/questions`, {
        headers: {
          Authorization: `Bearer ${context.state.proansToken}`,
        },
      }).then((res) => {
        if (res.status === 200) {
          context.commit('initProblems', res.data);
        }
      }).catch((err) => {
        switch (err.response.status) {
          case 403:
            router.push({
              name: 'UnAuthView',
            });
            break;
          default:
            console.log(err.response);
        }
      });
    },
    updateProblem(context, problem) {
      console.log(111, problem);
      axios.get(`/api/v1/questions/${problem.id || context.state.qid}`, {
        headers: {
          Authorization: `Bearer ${context.state.proansToken}`,
        },
      }).then((res) => {
        if (res.status === 200) {
          context.commit('updateProblem', res.data);
        }
      });
    },
    setCommentList(context) {
      axios.get(`/api/v1/questions/${context.state.qid}/discussions`, {
        headers: {
          Authorization: `Bearer ${context.state.proansToken}`,
        },
      }).then((res) => {
        console.log(res);
        if (res.status !== 200) {
          console.log(JSON.stringify(res.data));
          return;
        }
        context.commit({
          type: 'setCommentList',
          list: res.data,
        });
      }).catch((err) => {
        if (err.response.status === 401
          && err.response.data.msg === 'Token expired') {
          Message.error('登录已失效，请重新登录！');
          context.commit('setProansToken', '');
          const currentUrl = window.location.href;
          const appname = currentUrl.slice(0, currentUrl.indexOf('#'));
          const hashparam = currentUrl.slice(currentUrl.indexOf('#') + 1);
          const serviceUrl = `${appname}?hashparam=${hashparam}`;
          window.location.href = `http://passport.ustc.edu.cn/logout?service=${encodeURIComponent(serviceUrl)}`;
        }
      });
    },
    getCourseInfo(context) {
      axios.get(`/api/v1/courses/${context.state.cid}`)
        .then((res) => {
          if (res.status !== 200) {
            console.log(JSON.stringify(res.data));
            return;
          }
          context.commit('getCourseInfo', res.data);
        });
    },
    setAuth(context, tid) {
      console.log(context.state.token);
      axios.get(`/api/v1/users/${tid}/teaching_courses`, {
        headers: {
          Authorization: `Bearer ${context.state.token}`,
        },
      }).then((res) => {
        console.log('courses get: ', res);
        const courses = res.data;
        if (context.state.auth === '学生'
        && courses.length !== 0) {
          context.commit('setAuth', 'assistantScope');
        }
      });
    },
  },
  modules: {
  },
  plugins: [
    new VuexPersistence().plugin,
  ],
});
