module.exports = 
{
    
    getDagTotal: function(dag_begin, dag_eind, pauze)
    {

        dag_begin = this.trim(dag_begin);
        dag_eind = this.trim(dag_eind);
        pauze = this.trim(pauze);

        var dateBegin = new Date("01/01/2017 " + dag_begin);
        var dateEind = new Date("01/01/2017 " + dag_eind);

        if (dateEind < dateBegin)
        {
            dateEind = new Date("01/02/2017 " + dag_eind);
        }

        var difference = new Date(dateEind.getTime() - dateBegin.getTime());
        var pauzeTime = new Date("01/01/2017 " + pauze);
        var hours = difference.getHours() - pauzeTime.getHours();
        var minutes = difference.getMinutes() - pauzeTime.getMinutes();
                
        if (minutes < 0)
        {
            minutes = 60 + minutes;
            hours -= 1;
        }
        if (hours < 0)
        {
            hours = 0;
        }
        
        return (hours > 10 ? hours : "0" + hours) + ":" + (minutes > 10 ? minutes : "0" + minutes);

    },

    trim: function(time)
    {
        if (time.length > 5)
        {
            return time.substr(0,5);
        }

        return time;
    }

}
