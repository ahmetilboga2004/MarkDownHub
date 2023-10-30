from app import db

class Dersler(db.Model):
    __tablename__ = 'dersler'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    content = db.Column(db.Text)
    edit_text = db.Column(db.Text)
    mark_text = db.Column(db.Text)
    answer = db.Column(db.Text)
    
    def __init__(self, name, content, edit_text, mark_text, answer):
        self.name = name
        self.content = content
        self.edit_text = edit_text
        self.mark_text = mark_text
        self.answer = answer
        
    def __repr__(self):
            return '<Dersler %r>' % self.name