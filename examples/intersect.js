
var Intersect = {
      // ========================= PLUCKER FUNCTIONS ============================
  /*
* Compute the Plücker coordinates of the vector AB
*/
  plucker_vector: function(A,B) {
    return [
      A[0]*B[1]-A[1]*B[0],
      A[0]*B[2]-A[2]*B[0],
      A[0]-B[0],
      A[1]*B[2]-A[2]*B[1],
      A[2]-B[2],
      B[1]-A[1]
    ];
  },

  /*
* Compute the Plücker coordinates for an axis (P, u)
*/
  plucker_axis: function(P,u) {
    return [
      P[0]*u[1]-P[1]*u[0],
      P[0]*u[2]-P[2]*u[0],
      -u[0],
      P[1]*u[2]-P[2]*u[1],
      -u[2],
      u[1]
    ];
  },

  /*
* Plücker side() functions
* L &rarr; Plücker coordinates of the vector
* R &rall; Plücker coordinates of the axis
*/
  side: function(L,R) {
    return R[2]*L[3]+R[5]*L[1]+R[4]*L[0]+R[1]*L[5]+R[0]*L[4]+R[3]*L[2];
  },
  
   /*
* Compute the Plücker coordinates for each edge of a triangle ABC
*/
  plucker_triangle: function(A,B,C) {
    return [this.plucker_vector(A,B),
            this.plucker_vector(B,C),
            this.plucker_vector(C,A)
           ];
  },

  /*
* Compute the Plücker coordinates for each edge of a quad ABCD
*/
  plucker_quad: function(A,B,C,D) {
    return [this.plucker_vector(A,B),
            this.plucker_vector(B,C),
            this.plucker_vector(C,D),
            this.plucker_vector(D,A)
           ];
  },

  /*
* compute the intersection between a triangle,
* represented by an array storing the Plücker coordinates of its edges,
* and a ray represented by its Plücker coordinates
*/
  intersect_ray_triangle: function(pluck_R, pluck_triangle) {
    var side0=this.side(pluck_triangle[0], pluck_R);
    if (side0*this.side(pluck_triangle[1], pluck_R)<0) return false;
    if (side0*this.side(pluck_triangle[2], pluck_R)<0) return false;
    return true;
  },

  /*
* Returns the plücker coordinates for the edges of the 4 quads to test
* to test the intersection between a quad and a AABB.
* c = [Cx, Cy, Cz] is the center of the AABB
* d = [Dx, Dy, Dz] is the dimension of the AABB
*/
  plucker_AABB: function(c, d) {
    //points of the AABB
    var A=[c[0]+0.5*d[0], c[1]-0.5*d[1], c[2]-0.5*d[2]],
        B=[c[0]+0.5*d[0], c[1]+0.5*d[1], c[2]-0.5*d[2]],
        C=[c[0]+0.5*d[0], c[1]+0.5*d[1], c[2]+0.5*d[2]],
        D=[c[0]+0.5*d[0], c[1]-0.5*d[1], c[2]+0.5*d[2]],
        E=[c[0]-0.5*d[0], c[1]-0.5*d[1], c[2]-0.5*d[2]],
        F=[c[0]-0.5*d[0], c[1]+0.5*d[1], c[2]-0.5*d[2]],
        G=[c[0]-0.5*d[0], c[1]+0.5*d[1], c[2]+0.5*d[2]],
        H=[c[0]-0.5*d[0], c[1]-0.5*d[1], c[2]+0.5*d[2]];
    return [
      this.plucker_quad(B,C,H,E),
      this.plucker_quad(A,D,G,F),
      this.plucker_quad(A,B,F,E),
      this.plucker_quad(D,C,G,H)
    ];
  },

  /*
* Test the intersection between a quad represented by its edge Plücker co array,
* and a ray represented by its Plücker coordinates
*/
  intersect_ray_quad: function(pluck_R, pluck_quad) {
    var side0=this.side(pluck_quad[0], pluck_R);
    if (side0*this.side(pluck_quad[1], pluck_R)<0) return false;
    if (side0*this.side(pluck_quad[2], pluck_R)<0) return false;
    if (side0*this.side(pluck_quad[3], pluck_R)<0) return false;
    return true;
  },

  /*
* Test the intersection between a AABB, represented by its quads to test
* (computed with this.plucker_AABB(...),
* and a ray represented by its Plücker coordinates
*/
  intersect_ray_AABB: function(pluck_R, quads) {
    if (this.intersect_ray_quad(pluck_R, quads[0])) return true;
    if (this.intersect_ray_quad(pluck_R, quads[1])) return true;
    if (this.intersect_ray_quad(pluck_R, quads[2])) return true;
    if (this.intersect_ray_quad(pluck_R, quads[3])) return true;
    return false;
  },


      // ========================= SAT FUNCTIONS ============================
  /*
* returns the abscissa of the point A on the axis ([0,0,0], u)
* i should be a unit vector
*/
  abscissa_on_axis: function(u, A) {
    return Lib.dot(A, u);
  },


  /*
* test a separating axis
* A,B : points lists of 2 convex polyhedra
* Ru : direction of the separating axis
* return true if this is a separating axis
*/
  is_separating_axis: function(A,B,Ru) {
    var xA=[], xB=[], i, r=true;
    for (i=0; i<A.length; i++) {
      xA.push(this.abscissa_on_axis(Ru, A[i]));
    }
    xA.sort(function(a,b) {return a-b;});

    for (i=0; i<B.length; i++) {
      xB.push(this.abscissa_on_axis(Ru, B[i]));
    }
    xB.sort(function(a,b) {return a-b;});

    return((xA[0]>xB[xB.length-1]) || (xA[xA.length-1]<xB[0]));
  },


  /*
* Get the edges array of a triangle
*/
  get_tri_edges: function(T) {
    return [Lib.subNew(T[1], T[0]),
            Lib.subNew(T[2], T[1]),
            Lib.subNew(T[0], T[2])];
  },


  /*
* Compute the normal vector of a triangle
*/
  get_tri_normal: function(T) {
    var AB=Lib.subNew(T[1], T[0]),
        AC=Lib.subNew(T[2], T[0]);
    var N=Lib.cross(AB, AC);
    Lib.normalize(N);
    return N;
  },


  /*
* Test intersection between a AABB and a triangle T = [A, B, C]
* Cd=[Cx, Cy, Cz] are the dimension of the AABB
* CO is the center of the AABB
*/
  test_AABB_triangle: function(CO, Cd, T) {

    //trivial test : return true if a point of the triangle is in the AABB
    //it is very fast and it avoid more complicated calculus
    if ((T[0][0]>CO[0]-Cd[0]/2 && T[0][0]<CO[0]+Cd[0]/2)
        && (T[0][1]>CO[1]-Cd[1]/2 && T[0][1]<CO[1]+Cd[1]/2)
        && (T[0][2]>CO[2]-Cd[3]/2 && T[0][2]<CO[2]+Cd[2]/2)) return true;

    //Applying SAT :

    //build the point list of the AABB, C
    var C=[], x,y,z, O=[0,0,0], i,j, W;
    for (x=-0.5; x<=0.5; x++) {
      for (y=-0.5; y<=0.5; y++)  {
        for (z=-0.5; z<=0.5; z++) {
          C.push([CO[0]+x*Cd[0], CO[1]+y*Cd[1], CO[2]+z*Cd[2]]);
        }
      }
    }

    //direction of axis perpendicular to AABB faces
    var Caxes=[[1,0,0], [0,1,0], [0,0,1]];

    //triangle edges
    var Tedges=this.get_tri_edges(T);

    //test if there is a separating axis perpendicular to the triangle
    var N=this.get_tri_normal(T);
    if (this.is_separating_axis(C, T, N)) return false;

    //Test separating axis perpendicular to a face of the AABB
    for (i=0; i<3; i++) {
      if (this.is_separating_axis(C, T, Caxes[i])) return false;
    }


    //Test separating axis perp. to an edge of the triangle, and a face of the AABB
    for (i=0; i<3; i++) {
      for (j=0; j<3; j++) {
        W=Lib.cross(Caxes[i], Tedges[j]);
        Lib.normalize(W);
        if (this.is_separating_axis(C,T,W)) return false;
      }
    }
    return true;
  }
    
};