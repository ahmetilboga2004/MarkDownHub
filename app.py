from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import markdown
from bs4 import BeautifulSoup

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dersler.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

from model import Dersler  # Dersler modelini içe aktar


currentDersIndex = 1

@app.route("/")
def home():
    ilkDers = Dersler.query.get(currentDersIndex)
    return render_template("index.html", ders = ilkDers)

@app.route('/editor')
def editor():
    return render_template("editor.html")

@app.route('/about')
def about():
    return render_template("about.html")


@app.route("/getDers")
def getDers():
    ders = Dersler.query.order_by(Dersler.id).first()
    total_ders_count = Dersler.query.count()  # Toplam ders sayısını al
    if ders:
        # Ders verilerini JSON formatında döndür
        response = {'id': ders.id, 'name': ders.name, 'content': ders.content}
        if (ders.edit_text is not None and ders.edit_text != ""):
            response['is_ask'] = True
            response['edit_text'] = ders.edit_text
            response['mark_text'] = ders.mark_text
        else:
            response['is_ask'] = False
        if currentDersIndex < total_ders_count:
            response['is_next'] = True
        else:
           response['is_next'] = False
           
        if currentDersIndex > 1:
            response['is_prev'] = True
        else:
            response['is_prev'] = False
        return jsonify(response)
    else:
        return jsonify({'error': 'Ders bulunamadı'})


@app.route('/oncekiDers')
def oncekiDers():
    global currentDersIndex
    total_ders_count = Dersler.query.count()
    if currentDersIndex > 1:
        currentDersIndex -= 1
    onceki_ders = Dersler.query.filter_by(id=currentDersIndex).first()

    if onceki_ders:
        # Ders verilerini JSON formatında döndür
        response = {'id': onceki_ders.id, 'name': onceki_ders.name, 'content': onceki_ders.content}
        if (onceki_ders.edit_text is not None and onceki_ders.edit_text != ""):
            response['is_ask'] = True
            response['edit_text'] = onceki_ders.edit_text
            response['mark_text'] = onceki_ders.mark_text
        else:
            response['is_ask'] = False
        
        if currentDersIndex < total_ders_count:
            response['is_next'] = True
        else:
            response['is_next'] = False
            
        if currentDersIndex > 1:
            response['is_prev'] = True
        else:
            response['is_prev'] = False
            
        return jsonify(response)
    else:
        return jsonify({'error': 'Ders bulunamadı'})
    
@app.route('/sonrakiDers')
def sonrakiDers():
    global currentDersIndex
    total_ders_count = Dersler.query.count()  # Toplam ders sayısını al
    if currentDersIndex < total_ders_count:
        currentDersIndex += 1
    sonraki_ders = Dersler.query.filter_by(id=currentDersIndex).first()

    if sonraki_ders:
        # Ders verilerini JSON formatında döndür
        response = {'id': sonraki_ders.id, 'name': sonraki_ders.name, 'content': sonraki_ders.content}
        if (sonraki_ders.edit_text is not None and sonraki_ders.edit_text != ""):
            response['is_ask'] = True
            response['edit_text'] = sonraki_ders.edit_text
            response['mark_text'] = sonraki_ders.mark_text
        else:
            response['is_ask'] = False
        
        if currentDersIndex < total_ders_count:
            response['is_next'] = True
        else:
            response['is_next'] = False
            
        if currentDersIndex > 1:
            response['is_prev'] = True
        else:
            response['is_prev'] = False
            
        return jsonify(response)
    else:
        return jsonify({'error': 'Ders bulunamadı'})
    
@app.route("/cevapKontrol", methods=["GET"])
def cevapKontrol():
    if request.method == "GET":
        user_cevap = request.args.get('user_cevap')
        userCevapHtml = markdown.markdown(user_cevap)
        ders = Dersler.query.filter_by(id=currentDersIndex).first()
        dbAnswerHtml = markdown.markdown(ders.answer.lower())
        
        userCevapSoup = BeautifulSoup(userCevapHtml, "html.parser")
        dbAnswerSoup = BeautifulSoup(dbAnswerHtml, "html.parser")
        
        # Veritabanındaki tüm elementleri kontrol et
        for db_element in dbAnswerSoup.find_all():
            # Kullanıcının cevabındaki aynı elementleri bul
            user_elements = userCevapSoup.find_all(db_element.name)

            if user_elements:
                db_element_text = db_element.get_text()

                user_element_text = ""
                # Her kullanıcı elementini kontrol et
                for user_element in user_elements:
                    user_element_text += user_element.get_text()

                # Eğer veritabanındaki içerik, kullanıcının cevabındaki içeriğin içindeyse kabul edilebilir
                if db_element_text in user_element_text:
                    continue
                else:

                    return jsonify({'is_true': False})
            else:
                return jsonify({'is_true': False})
        return jsonify({'is_true': True})
    else:
        return jsonify({"Error", "İstek Başarısız"})

        
@app.route('/cevapGoster', methods=["GET"])
def cevapGoster():
    if request.method == "GET":
        ders = Dersler.query.filter_by(id=currentDersIndex).first()
        cevap = ders.answer

        return jsonify({'cevap': cevap})
    else:
        return jsonify({"Error": "İstek başarısız oldu"})


@app.route('/lessons')
def showLessons():
   lessons = db.session.query(Dersler).all()
   return render_template("lessons.html", lessons=lessons)

@app.route("/lessons/new/", methods=["GET", "POST"])
def newLesson():
    if request.method == "POST":
        newLesson = Dersler(name = request.form['lessonName'], content = request.form['lessonContent'], edit_text = request.form['lessonEditText'], mark_text = request.form['lessonMarkText'], answer = request.form['lessonAnswer'])
        db.session.add(newLesson)
        db.session.commit()
        return redirect(url_for('showLessons'))
    else:
       return render_template('addLesson.html')
   
   
#Function to edit a student
@app.route("/lessons/<int:lesson_id>/edit/", methods = ['GET', 'POST'])
def editLesson(lesson_id):
   editedLesson = db.session.query(Dersler).filter_by(id=lesson_id).one()
   if request.method == 'POST':
        if (request.form['content'] or request.form['editText'] or request.form['markText'] or request.form['answer']):
            editedLesson.content = request.form['content']
            editedLesson.edit_text = request.form['editText']
            editedLesson.mark_text = request.form['markText']
            editedLesson.answer = request.form['answer']
            db.session.commit()
            return redirect(url_for('showLessons'))
        else:
            return redirect(url_for("showLessons"))
   else:
       return render_template('editLesson.html', lesson = editedLesson)
   
#Function to delete a student
@app.route('/lessons/<int:lesson_id>/delete/', methods = ['GET','POST'])
def deleteLesson(lesson_id):
   lessonToDelete = db.session.query(Dersler).filter_by(id=lesson_id).one()
   if request.method == 'POST':
       db.session.delete(lessonToDelete)
       db.session.commit()
       return redirect(url_for('showLessons', lesson_id=lesson_id))
   else:
       return render_template('deleteLesson.html', lesson = lessonToDelete)


if __name__ == "__main__":
    app.run(debug=False)
