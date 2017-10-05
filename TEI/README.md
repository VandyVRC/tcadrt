# Architecture of Chinese Temples TEI data repository

Contents

/TEI

  /data
  
        Contents under this directory are automatically generated using ../processing/transform-building.xsl and ../processing/transform-site.xsl
        
        /places/buildings
            Syriaca.org compliant (http://syriaca.org/documentation/syriaca-tei-main.rnc) TEI files for building
        
        /places/sites   
            Syriaca.org compliant (http://syriaca.org/documentation/syriaca-tei-main.rnc) TEI files for building
  
  /processing
  
    * building.xml xml version of ../../building/building.csv
    
    * building2tei-map is a rough map of csv fields to TEI elements for building.xml. Not all elements have been mapped yet
    
    * transform-building.xsl transforms building.xml to Syriaca.org compliant TEI stored in ../data/places/buildings/tei
    
    * site.xml xml version of ../../site/site.csv
    
    * site2tei-map.xml is a rough map of csv fields to TEI elements for site.xml. Not all elements have been mapped yet
    
    * transform-site.xsl transforms building.xml to Syriaca.org compliant TEI stored in ../data/places/site/tei
    

