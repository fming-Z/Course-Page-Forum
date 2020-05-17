from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship, reconstructor

from app.models.base import Base
from app.models.relation import question_tag_table


class Question(Base):
    id = Column(Integer, primary_key=True)
    title = Column(String(127), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(10), ForeignKey('user.gid'))
    stars = Column(Integer, default=0)
    answer = relationship('Answer', backref='question')
    discussions = relationship('Discussion', backref='question')
    course_id = Column(Integer, ForeignKey('course.cid'))
    tags = relationship('Tag', backref='question', secondary=question_tag_table)

    @reconstructor
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields = ['id', 'title', 'starts', 'tags']