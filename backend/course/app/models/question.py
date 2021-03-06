from datetime import datetime

from flask import g
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship, reconstructor, backref

from app.models.base import Base
from app.models.relation import question_tag_table
from app.models.upvote import QuestionUpVote


class Question(Base):
    id = Column(Integer, primary_key=True)
    title = Column(String(127), nullable=False)
    content = Column(Text, nullable=False)
    author_gid = Column(String(10), ForeignKey('user.gid'))
    teacher_aid = Column(Integer, ForeignKey('answer.id'))
    student_aid = Column(Integer, ForeignKey('answer.id'))
    discussions = relationship('DiscussionTopic')
    course_id = Column(Integer, ForeignKey('course.cid'))
    tags = relationship('Tag', secondary=question_tag_table)
    update_time = Column(Integer)
    teacher_answer = relationship('Answer', foreign_keys=teacher_aid,
                                  backref=backref('question_from_teacher', uselist=False))
    student_answer = relationship('Answer', foreign_keys=student_aid,
                                  backref=backref('question_from_student', uselist=False))
    up_votes = relationship('QuestionUpVote')
    author = relationship('User')
    # history = relationship('History', foreign_keys='History.root_qid')
    dump_fields = ['title', 'content']

    @reconstructor
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields = ['id', 'title', 'tags', 'content', 'student_answer', 'teacher_answer', 'history', 'stars',
                       'update_datetime', 'create_datetime', 'author', 'liked']

    @property
    def update_datetime(self):
        if self.update_time:
            return datetime.fromtimestamp(self.update_time)
        else:
            return None

    @property
    def stars(self):
        # todo: count()
        return QuestionUpVote.query.filter_by(question_id=self.id).count()

    @property
    def liked(self):
        return QuestionUpVote.query.filter_by(question_id=self.id, user_gid=g.user['gid']).count() != 0

    @property
    def belong_course(self):
        return self.course_id

    @property
    def belong_author(self):
        return self.author_gid
