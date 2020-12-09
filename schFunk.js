const getRefObj = (obj) =>{
    
    if (!obj._id) {
        return '==='
    }
    return obj._id.split('|')[1]
}

const _blanc = ()=>{return null}

const createQuery = (info,class_name,type,limit='')=>{
    var setF = new Set();
    console.log('mapfields:',info.fieldNodes[0].selectionSet.selections.map((e)=>{
        var _fields = type;//BuyersOrderType
        var _field =_fields.getFields()[e.name.value]     
        if (_field.type.extensions&&_field.type.extensions.otk) 
            setF.add({ field:e.name.value, ext :_field.type.extensions.otk})
        return e.name.value
    }))
    console.log('fields to resolve:',setF)
    strSel=strJoin="";
    setF.forEach((f)=>{
        console.log()
        strSel = strSel+"||JSONB_BUILD_OBJECT('"+f.field+"',a_"+f.field+".jsb)" 
        strJoin=strJoin+" LEFT JOIN "+f.ext.tbl+" a_"+f.field+" on ((d.jsb->>'"+f.field+"')= a_"+f.field+"."+f.ext.keyF+" and a_"+f.field+".jsb->>'class_name'='"+f.ext.class_name+"')";
    })
    console.log(strSel)
    console.log(strJoin)
    var qq = "SELECT d.jsb"+strSel+" jsb FROM doc d "+ strJoin + " where d.jsb->>'class_name'= 'doc."+class_name+"'" 
    var qq = qq + "LIMIT "+limit 
    return qq
}

const createQueryTabular = (par,info,tabular,class_name,type,limit='')=>{
    var setF = new Set();
   
    console.log('mapfields:',info.fieldNodes[0].selectionSet.selections.map((e)=>{
   
        var _fields = type;//BuyersOrderType
        var _field =_fields.getFields()[e.name.value]     
        //console.log('_field:',info.fieldNodes[0].selectionSet.selections)
        if (_field.type.extensions&&_field.type.extensions.otk) 
            {
                console.log('e:',e)
                setF.add({ field:e.name.value, ext :_field.type.extensions.otk})
            }
        return e.name.value
    }))
    console.log('fields to resolve:',setF)
    strSel=strJoin="";
    setF.forEach((f)=>{
       // console.log(f)
        strSel = strSel+"||JSONB_BUILD_OBJECT('"+f.field+"',a_"+f.field+".jsb)" 
        strJoin=strJoin+" LEFT JOIN "+f.ext.tbl+" a_"+f.field+" on ((d.jsb->>'"+f.field+"')= a_"+f.field+"."+f.ext.keyF+" and a_"+f.field+".jsb->>'class_name'='"+f.ext.class_name+"')";
    })
    console.log(strSel)
    console.log(strJoin)
 
    var qq = "SELECT d.jsb->'"+tabular+"' "+strSel+" jsb FROM doc d "+ strJoin + " where (d.jsb->>'class_name'= 'doc."+class_name+"' and (d.id = '"+par._id+"' ))" 
    var qq = qq + " LIMIT "+limit 
    console.log(qq)
    return qq
}

module.exports = { getRefObj:getRefObj,
    _blanc:_blanc,
    createQuery:createQuery,
    createQueryTabular:createQueryTabular
}